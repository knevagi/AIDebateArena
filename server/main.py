from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from typing import List, Optional
import os
from dotenv import load_dotenv
from langsmith import traceable
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
os.environ["ANTHROPIC_API_KEY"] = os.getenv('ANTHROPIC_API_KEY')

# Initialize FastAPI app
app = FastAPI(
    title="AI Response Service",
    description="A FastAPI service for OpenAI integration",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Configure LangSmith
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = os.getenv('LANGSMITH_API_KEY')
os.environ["LANGCHAIN_PROJECT"] = "openai-service"  # Your project name

class Message(BaseModel):
    role: str
    content: Optional[str] = None

class OpenAIModel(BaseModel):
    name: str
    id: str
    available: bool

DEFAULT_OPENAI_MODEL = "gpt-3.5-turbo"

class RequestBody(BaseModel):
    messages: List[dict]
    model1: str
    model2:str
    rounds:str

@traceable
def get_ai_response(model,model2,side_given,chatHistory): 
    side=""
    if side_given=="for":
        side="for the proposition"
    else:
        side="against the proposition"
    messages = [
    SystemMessage(content=" This is a debate competition between "+model+" and "+model2+". \
                        You will be "+model+" and you will be "+side+" and you will only speak for "+model+".You will be given a topic from the user and your opponents responses and your job is to debate on that topic. \
                        Incase you are the first to speak as in your opponent's response is empty you will start the debate with your opening statement. \
                        You will only talk for yourself and speak your side of the debate. Whenever you argue, if your opponent has said something before make sure to understand what your opponent has said and try and counter their argument. \
                        Be aggressive about your stance but still always make logical points and make sure you address your opponent directly. \
                        Make sure to keep your responses in a dialog format and in your responses add your name and colon followed by your response specifically \""+model+":\". \
                        You only need to give one response and keep it short concise and direct and always try to respond to the latest response of your opponents' and never repeat points you have already made unless you have to to counter your opponents current point.")
    ]

    #messages+=chatHistory
    transformed_chatHistory = []
    messages = messages + chatHistory 
    print(messages)
    if model=="ChatGPT":
        chat = ChatOpenAI(
            model=os.getenv('OPENAI_MODEL', 'gpt-4o'),
            temperature=float(os.getenv('TEMPERATURE', '0.7')),
            max_tokens=int(os.getenv('MAX_TOKENS', '150')),
        )
        response_openai = chat.invoke(messages)
        return response_openai.content.strip()
    elif model=="Claude":
        chat = ChatAnthropic(
            model=os.getenv('ANTHROPIC_MODEL', 'claude-3-5-sonnet-20240620'),
            temperature=float(os.getenv('TEMPERATURE', '0.7')),
            max_tokens=int(os.getenv('MAX_TOKENS', '150')),
        )
        response_claude = chat.invoke(messages)
        return response_claude.content.strip()
    else:
        chat = ChatGoogleGenerativeAI(
            model=os.getenv('GEMINI_MODEL', 'gemini-1.5-pro'),
            google_api_key=os.getenv('GOOGLE_API_KEY'),
            temperature=float(os.getenv('TEMPERATURE', '0.7')),
            max_output_tokens=int(os.getenv('MAX_TOKENS', '150')),
        )
        response_gemini = chat.invoke(messages)
        return response_gemini.content.strip()


@traceable
@app.post("/send_answer")
async def send_answer(body: RequestBody):
    print(body.model1)
    messages = body.messages
    model1name=body.model1
    model2name=body.model2
    chances=int(body.rounds)
    try:
        formatted_messages = []
        model1Messages=[]
        model2Messages=[]
        for msg in messages:
            if msg['role'] == 'system':
                formatted_messages.append(SystemMessage(content=msg['content']))
                model1Messages.append(SystemMessage(content=msg['content']))
                model2Messages.append(SystemMessage(content=msg['content']))
            elif msg['role'] == 'user':
                formatted_messages.append(HumanMessage(content=msg['content']))
                model1Messages.append(HumanMessage(content=msg['content']))
                model2Messages.append(HumanMessage(content=msg['content']))
            elif msg['role'] == 'assistant':
                formatted_messages.append(AIMessage(content=msg['content']))
                model1Messages.append(AIMessage(content=msg['content']))
                model2Messages.append(AIMessage(content=msg['content']))

        if not any(isinstance(msg, HumanMessage) for msg in formatted_messages):
            raise ValueError("At least one user message is required")
        rounds = []
        
        for i in range(chances):
            response_model1=get_ai_response(model1name,model2name,"for",model1Messages)
            model1Messages.append(AIMessage(response_model1))
            model2Messages.append(HumanMessage(response_model1))
            response_model2=get_ai_response(model2name,model1name,"against",model2Messages)
            model1Messages.append(HumanMessage(response_model2))
            model2Messages.append(AIMessage(response_model2))
            rounds.append({
                "Model1Res": response_model1,
                "Model2Res": response_model2,
            })
        return rounds

    except Exception as error:
        print(f"Error: {error}")
        raise HTTPException(status_code=500, detail="An error occurred during ping to OpenAI. Please try again.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
