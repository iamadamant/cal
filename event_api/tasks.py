import threading as t
import datetime

from django.conf import settings
from django.core.mail import send_mail
from .models import Event


def mail_handler():
    thread = t.Thread(target=_mail_handler)
    thread.daemon = True
    thread.start()

def _mail_handler():
    while True:
        for event in Event.objects.filter(checked=False):
            date = event.date
            d = datetime.datetime(year=date.year, month=date.month, day=date.day, hour=date.hour, second=date.second)
            # проверяем, не подошло ли время оповещения
            if datetime.datetime.now() >= d - datetime.timedelta(hours=1):

                #Если мы еще не отправили уведомление
                if not event.checked:
                    user = event.user
                    send_mail(
                        event.title,
                        event.description,
                        settings.EMAIL_HOST_USER,
                        [user.email]
                    )
                    #Помечаем, что отправили
                    event.checked = True
                    event.save()
