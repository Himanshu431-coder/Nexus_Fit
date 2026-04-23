FROM python:3.11-slim

WORKDIR /app

COPY api/requirements.txt ./api/
RUN pip install --no-cache-dir -r ./api/requirements.txt

COPY api/ ./api/
COPY ml/ ./ml/

WORKDIR /app/api

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
