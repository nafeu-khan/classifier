from django.shortcuts import render
from .serializers import FaqSerializer
from .models import Faq
from rest_framework.response import Response
from rest_framework import status
# Create your views here.

class FaqView:
    def get(self, request):
        faqs = Faq.objects.all()
        serializer=FaqSerializer(faqs,many=True)
        if serializer.is_valid():
            return Response(serializer.data)
        return Response({'error':serializer.errors},status=status.HTTP_400_BAD_REQUEST)
    
    def post(self,request):
        serializer=FaqSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({'error':serializer.errors},status=status.HTTP_400_BAD_REQUEST)
    def put(self,request,pk):
        
        faq=Faq.objects.get(pk=pk)
        serializer=FaqSerializer(faq,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({'error':serializer.errors},status=status.HTTP_400_BAD_REQUEST)
    def delete(self,request,pk):
        try:
            faq=Faq.objects.get(pk=pk)
            faq.delete()
            return Response({'messege':"faq is deleted"},status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error':e},status=status.HTTP_404_NOT_FOUND)