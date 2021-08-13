import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import Views from './render/views/index'

declare global {
    interface Window {
        api: {
            send: (channel: string, ...arg: any) => void;
            receive: (channel: string, func: (event: any, ...arg: any) => void) => void;
        },
        platform: string
    }
}


initializeIcons();

function render() {
    ReactDOM.render(<Views />, document.querySelector("#app"));
}

render();