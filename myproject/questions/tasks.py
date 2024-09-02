from celery import shared_task
import google.generativeai as genai
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
from time import sleep
import logging
import pdb


logger = logging.getLogger(__name__)

print('hello i am here at tasks')

@shared_task
def generate_mcqs_task(api_key, prompt, room_name):
    print(api_key)
    pdb.set_trace()
   
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    channel_layer = get_channel_layer()

    try:
        logger.info(f"Generating content with prompt: {prompt}")
        response = model.generate_content(prompt)
        if not response or not response.text:
            logger.error("Model response is empty or None.")
            return None

        generated_mcqs = response.text
        start_index = generated_mcqs.find('[')
        end_index = generated_mcqs.rfind(']') + 1
        if start_index == -1 or end_index == -1:
            logger.error("Failed to extract JSON data from the model response.")
            return None

        json_data = generated_mcqs[start_index:end_index]
        mcqs = json.loads(json_data)
        
        for mcq in mcqs:
            async_to_sync(channel_layer.group_send)(
                f'questions_{room_name}',
                {
                    'type': 'question_message',
                    'message': mcq
                }
            )
        return mcqs
    except json.JSONDecodeError as e:
        logger.error(f"JSON decoding error: {e}")
        return None
    except Exception as e:
        logger.error(f"Error generating MCQs: {e}")
        return None
    


@shared_task
def my_first_task(duration):
    sleep(duration)
    return('first_assignment_done')
