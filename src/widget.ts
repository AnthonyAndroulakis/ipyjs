// Copyright (c) anthony
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
} from '@jupyter-widgets/base';

import { MODULE_NAME, MODULE_VERSION } from './version';

// Import the CSS
import '../css/widget.css';

//https://developer.chrome.com/blog/how-to-convert-arraybuffer-to-and-from-string/
function arrayBufferToString(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  return String.fromCharCode.apply(null, [...bytes]);
}

function stringToArrayBuffer(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

export class ExampleModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: ExampleModel.model_name,
      _model_module: ExampleModel.model_module,
      _model_module_version: ExampleModel.model_module_version,
      _view_name: ExampleModel.view_name,
      _view_module: ExampleModel.view_module,
      _view_module_version: ExampleModel.view_module_version,
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    // Add any extra serializers here
  };

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);

    this.on('msg:custom', (command: any, buffers: any) => {
      this.currentProcessing = this.currentProcessing.then(async () => {
        await this.onCommand(command, buffers);
      });
    });
  }

  private async onCommand(command: any, buffers: DataView[]) {
    const name: string = command[0];
    const args: any[] = command[1];
    if (name === 'runCustomCode') {
      console.log('received msg')
      let result,
      hasResult = false;
      const code = arrayBufferToString(buffers[0].buffer);
      console.log('converted msg to string')
      try {
        result = eval(code);
        console.log('evaled msg')
        hasResult = true;
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.stack);
        }
      }
      this.sendCustomCodeResult(args[0], hasResult, result);
    }
  }

  private sendCustomCodeResult(id: number, hasResult: boolean, result: any) {
    let data: ArrayBuffer = new ArrayBuffer(0);
    if (hasResult) {
      const str = result === undefined ? 'undefined' : JSON.stringify(result);
      data = stringToArrayBuffer(str);
    }

    //chunk data into 5mb chunks
    const chunkSize = 5 * 1024 * 1024;
    const numChunks = Math.ceil(data.byteLength / chunkSize);
    for (let i = 0; i < numChunks; ++i) {
      const begin = i * chunkSize;
      const end = Math.min(begin + chunkSize, data.byteLength);
      const chunk = data.slice(begin, end);
      this.send({ event: ['customCodeResult', id, numChunks - 1 - i] }, {}, [
        chunk,
      ]);
    }
    if (numChunks === 0) {
      this.send({ event: ['customCodeResult', id, 0] }, {});
    }
  }
  
  static model_name = 'ExampleModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'ExampleView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;

  private currentProcessing: Promise<void> = Promise.resolve();
}

export class ExampleView extends DOMWidgetView {
  render() {
    this.el.classList.add('custom-widget');
  }
}
