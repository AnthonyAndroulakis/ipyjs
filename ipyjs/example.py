#!/usr/bin/env python
# coding: utf-8

# Copyright (c) anthony.
# Distributed under the terms of the Modified BSD License.

"""
TODO: Add module docstring
"""

from ipywidgets import DOMWidget
from traitlets import Unicode
from ._frontend import module_name, module_version
import json
import random
import string
import time
from jupyter_ui_poll import ui_events

class ExampleWidget(DOMWidget):
    """TODO: Add docstring here
    """
    _model_name = Unicode('ExampleModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('ExampleView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    _custom_code_results = {}

    def __init__(self, *args, **kwargs):
        super(ExampleWidget, self).__init__(*args, **kwargs)
        self.on_msg(self._handle_frontend_msg)
    
    def _handle_frontend_msg(self, _, content, buffers):
        event_data = content.get('event', [None])
        if event_data[0] == 'customCodeResult':
            code_id = event_data[1]
            chunks_left = event_data[2]
            if code_id not in self._custom_code_results:
                self._custom_code_results[code_id] = {
                    'chunks_left': -1, #placeholder. Correct value added after data processed.
                    'result': b''
                }

            if len(buffers) > 0:
                self._custom_code_results[code_id]['result'] += buffers[0].tobytes()
            
            if chunks_left == 0:
                if len(buffers) == 0 or self._custom_code_results[code_id]['result'] == b'undefined':
                    loaded = None
                else:
                    loaded = json.loads(self._custom_code_results[code_id]['result'])
                self._custom_code_results[code_id]['result'] = loaded
            
            self._custom_code_results[code_id]['chunks_left'] = chunks_left

    def _send_custom(self, command, buffers=[]):
        self.send(command, buffers=buffers)
    
    def eval(self, code, timeout = 60):
        """
        Run a custom JavaScript code snippet
        Parameters:
            code (str): the code to run
            timeout (int): the maximum time to wait for the code to finish (in seconds)
        
        Returns:
            the result of the code
        """
        code_id = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(20))
        self._send_custom(['runCustomCode', [code_id]], [code.encode('utf-8')])

        start = time.time()
        i = 1
        with ui_events() as poll:
            while True:
                poll(1)
                #https://math.stackexchange.com/a/2678903
                num = int(((i+2) % 3) + 1)
                print(num * '.' + '  ', end='\r')
                i += 0.25
                time.sleep(0.1)
                if time.time() - start > timeout or (
                    code_id in self._custom_code_results
                    and self._custom_code_results[code_id]["chunks_left"] == 0
                ):
                    break
        print("Done.")
        result = self._custom_code_results.pop(code_id, {})
        return result.get('result', None)