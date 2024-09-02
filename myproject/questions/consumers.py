import json
from channels.generic.websocket import AsyncWebsocketConsumer

class QuestionConsumer(AsyncWebsocketConsumer):
    def connect(self):
        # self.room_name = self.scope['url_route']['kwargs']['room_name']
        # self.room_group_name = f'questions_{self.room_name}'
        # print(self.room_name)
        # await self.channel_layer.group_add(
        #     self.room_group_name,
        #     self.channel_name
        # )

        self.accept()

    def disconnect(self, close_code):
        # await self.channel_layer.group_discard(
        #     self.room_group_name,
        #     self.channel_name
        # )
        pass

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Broadcast the received message to all clients
        self.send(text_data=json.dumps({
            'message': message
        }))

    # async def question_message(self, event):
    #     message = event['message']

    #     await self.send(text_data=json.dumps({
    #         'message': message
    #     }))
