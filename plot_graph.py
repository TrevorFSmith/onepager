"""
This example generates random data and plots a graph in the browser.

It came from https://bitbucket.org/Jeffrey/gevent-websocket/src

Run it using Gevent directly using:
    python plot_grapg.py

Or with an Gunicorn wrapper:
    gunicorn -b 0.0.0.0:9000 -k "geventwebsocket.gunicorn.workers.GeventWebSocketWorker" plot_graph:app -D

"""

import gevent
import os
import random

from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler


def handle(ws):
    if ws.path == "/echo":
        while True:
            m = ws.receive()
            if m is None:
                break
            ws.send(m)

    elif ws.path == "/data":
        for i in xrange(10000):
            ws.send("0 %s %s\n" % (i, random.random()))
            gevent.sleep(1)

def app(environ, start_response):
    if environ["PATH_INFO"] in ("/data", "/echo"):
        handle(environ["wsgi.websocket"])
    else:
        start_response("404 Not Found", [])
        return []


if __name__ == "__main__":
    server = pywsgi.WSGIServer(("", 9000), app, handler_class=WebSocketHandler)
    server.serve_forever()