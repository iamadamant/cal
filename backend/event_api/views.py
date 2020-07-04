from django.http import QueryDict
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from .models import *
from .serializers import *
import datetime
import json
from django.contrib.auth import authenticate



class RegisterSet(viewsets.ViewSet):

    def register(self, request):
        data = json.loads(request.body.decode())
        data['is_active'] = True
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'user': user.id})
        else:
            return Response(serializer.errors, status=200)


class AuthorizeSet(viewsets.ViewSet):

    def authorize(self, request):
        data = json.loads(request.body.decode())
        username = data['username']
        password = data['password']

        # Временная затычка. Функция authenticate не работает. Выяснить почему!
        user = None
        try:
            user = User.objects.filter(username=username)[0]
        except IndexError:
            pass
        if user is not None:
            if user.check_password(password):
                return Response({'user': user.id})
            else:
                return Response({'error': 'password'}, status=200)
        else:
            return Response({'error': 'login'}, status=200)


class EventSet(viewsets.ViewSet):

    def list(self, request):
        user_id = request.GET.get('user')
        content = request.GET.get('content', '')
        user = User.objects.get(pk=user_id)
        date = request.GET.get('date', None)
        events = Event.objects.filter(title__icontains=content, user=user)
        if date and len(events)>0:
            event = events.order_by('-date')[0]
            if date == 'month':
                events = events.filter(date__gte=datetime.datetime(
                    event.date.year,
                    event.date.month,
                    1
                ))
            elif date == 'week':
                events = events.filter(date__gte=event.date-datetime.timedelta(days=7))
            elif date == 'day':
                events = events.filter(date__gte=datetime.datetime(
                    event.date.year,
                    event.date.month,
                    event.date.day
                ))
        serializer = EventCRUDSerializer(events, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk):
        event = Event.objects.get(pk=pk)
        serializer = EventCRUDSerializer(event)
        return Response(serializer.data, status=200)

    def create(self, request):
        d = json.loads(request.body.decode())
        serializer = EventCRUDSerializer(data=d)
        if serializer.is_valid():
            obj = serializer.save()
            return Response(EventCRUDSerializer(obj).data)
        else:
            return Response(serializer.errors)

    def update(self, request, pk):
        instance = Event.objects.get(pk=pk)
        d = json.loads(request.body.decode())
        serializer = EventCRUDSerializer(data=d, instance=instance)
        if serializer.is_valid():
            obj = serializer.save()
            return Response(EventCRUDSerializer(obj).data, status=200)
        else:
            return Response(serializer.errors)

    def delete(self, request, pk):
        instance = Event.objects.get(pk=pk)
        instance.delete()
        return Response(status=200)
