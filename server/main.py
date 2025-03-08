from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from typing import List, Optional
import os
from dotenv import load_dotenv
from langsmith import traceable
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

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
    model: Optional[OpenAIModel]

@traceable
@app.post("/send_answer")
async def send_answer(body: RequestBody):
    messages = body.messages
    model = body.model.id if body.model else DEFAULT_OPENAI_MODEL
    try:
        formatted_messages = [
            SystemMessage(content="You are ChatGPT. Respond to the user like you normally would.")
        ]
        for msg in messages:
            if msg['role'] == 'system':
                formatted_messages.append(SystemMessage(content=msg['content']))
            elif msg['role'] == 'user':
                formatted_messages.append(HumanMessage(content=msg['content']))
        
        if not any(isinstance(msg, HumanMessage) for msg in formatted_messages):
            raise ValueError("At least one user message is required")
        chat = ChatOpenAI(
            model_name=os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo'),
            temperature=float(os.getenv('TEMPERATURE', '0.7')),
            max_tokens=int(os.getenv('MAX_TOKENS', '150')),
        )
        response=chat(formatted_messages)

        return {"message": response.content}

    except Exception as error:
        print(f"Error: {error}")
        raise HTTPException(status_code=500, detail="An error occurred during ping to OpenAI. Please try again.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
