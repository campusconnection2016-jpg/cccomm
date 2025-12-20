import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("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"))

def generate_questions(topic):
    prompt = f"Generate 5 interview questions on {topic}"

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You generate clear interview questions."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7
    )

    return response.choices[0].message.content


print(generate_questions("Python Django"))
