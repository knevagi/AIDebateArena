from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
from langsmith import traceable
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
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

# Configure LangSmith
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = os.getenv('LANGSMITH_API_KEY')
os.environ["LANGCHAIN_PROJECT"] = "openai-service"  # Your project name

# Define the request model
class AstroRequest(BaseModel):
    prompt: str
    compiledData: str

@app.post("/get_response")
# @traceable(run_name="get_ai_response")
async def get_response(requestData: AstroRequest):
    data=requestData.compiledData
    system_prompt = f"""
    You are an expert vedic astrologer and a customer has a question about their horoscope.
    You will be given a Mahadasha Timeline and Planetary Positions.
    You will be given a question about the horoscope and you will answer the question based on the given information.

    You need to answer the question based on the given information. Make sure to use the correct information and explain how you arrived at the answer.

    Give specific details about their horoscope that helped you arrive at the answer. 
    Give specific dates based on the mahadasha information provided and
    make sure those dates are realistic and feasible, based on the personal information provided. Do not refer to dashas too far in the past and future.

    Also never give dates too far in he future to questions related to job and marriage.In case the estimated date for these questions is too far in the future, focus on the positive aspects of current dasha while showing hope for the future and a rough estimate of dates for their particular question.

    Only Consider the ongoing dashas and just next and just previous specially focusing on the current Dasha

    You need to keep your answer concise and to the point and avoid using unnecessary facts.

    Make sure your response is within 200 words. Be personable and do not sound robotic. Be empathetic to the customer and provide your answer with compassion and care.

    Whenever you are giving a prediction, make sure to use words like "It is likely that" or "It is possible that" to avoid making definitive statements.

    Additionally, use easy words and give simple answers that will be easy to understand for the customer. Always talk in first person like you are having a conversation with the customer and use a friendly tone.

    Given below is the complete detail of the customer including the Personal Information and Birth Chart Information

    {data}
    """
    @traceable(run_type="llm")
    def get_ai_response(system_prompt: str, user_prompt: str):
        chat = ChatOpenAI(
            model_name=os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo'),
            temperature=float(os.getenv('TEMPERATURE', '0.7')),
            max_tokens=int(os.getenv('MAX_TOKENS', '150')),
        )
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        response = chat(messages)
        return response.content

    try:
        response = get_ai_response(system_prompt, requestData.prompt)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
