# questions/models.py
from django.db import models

class GeneratedQuestion(models.Model):
    question_text = models.TextField()
    question_type = models.CharField(max_length=50)
    difficulty_level = models.CharField(max_length=50)
    marks = models.IntegerField()
    negative_marks = models.IntegerField(null=True, blank=True)
    
    def __str__(self):
        return self.question_text
