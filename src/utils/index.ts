import { Readable } from 'stream';

const fetch = require('node-fetch');


class Utils {
    private baseUrl = 'https://api.wit.ai/speech?v=20210928'
    private WITAI_TOK: string
    private witAI_lastcallTS: any = null;

    constructor(token: string|undefined) {
      if(!token) {
        console.error('missing wit ai api token');
    } else {
        this.WITAI_TOK = token
    }
    }



    private witAiCall = async (stream: any) => {
        const type = 'audio/raw;encoding=signed-integer;bits=16;rate=48k;endian=big'
      
        const text = await (await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + this.WITAI_TOK,
            'Content-Type': type,
          },
          body: stream,
        })).text()
      
        return text
      }
    
    private sleep(ms: number) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }

      public transcribe = async (buffer: any) => {
        try {
            // ensure we do not send more than one request per second
            if (this.witAI_lastcallTS != null) {
              let now = Math.floor(new Date() as unknown as number);
              while (now - this.witAI_lastcallTS < 1000) {
                console.log("sleep");
                await this.sleep(100);
                now = Math.floor(new Date()as unknown as number);
              }
            }
          } catch (e) {
            console.log("transcribe_witai 837:" + e);
          }
    
          try {
            var stream = Readable.from(buffer);
            let output = await this.witAiCall(stream)
            this.witAI_lastcallTS = Math.floor(new Date()as unknown as number);
            if(typeof output === 'string') {
              const thing = []
              for(let i = 0; i < output.length; i++) {
                if(output[i] === '}') {
                  thing.push(i)
                } else if(output[i] === '{') {
                  thing.push(i)
                }
              }
    
              ;
        
              const base = JSON.parse(output.substring(thing[thing.length-6], thing[thing.length]));
              return base.text;
              
            }
            return "";
          } catch (e) {
            console.log("transcribe_witai 851:" + e);
            console.log(e);
          }
    }

    public progressBar = (pro: number) => {
        pro =  Math.round(pro * 100)
    
        let result = '['
    
        for(let i = 0; i < pro; i++) {
            if(i % 5 === 0) {
                result += '='
            }
        }
        result += '>'
    
        for(let i = 0; i < (100-pro); i++) {
            if(i % 5 === 0) {
                result += '-'
            }
        }
    
        result += ']'
    
        return result
    }

    public sek2m = (sec: number) => {
        const result = Math.floor(sec / 60) + ":" + (sec % 60 ? sec % 60 : '00')
    
        return result
    }
    

    public commands = (text: string): void | string => {
        if(!text || text.length === 0 || text === '') {
            console.log('must provide text');
            return 'must provide text'
        }

        
        if(!text.startsWith('Tesla')|| !text.startsWith('tesla') || !text.startsWith('hey Tesla') || !text.startsWith('hey tesla') || !text.startsWith('Hey Tesla') || !text.startsWith('Hey tesla')) {
          console.log('no activation');
          return
        }
        
        text = text.replaceAll('.', '')
        text = text.replaceAll(':', '')
        text = text.replaceAll(',', '')
        text = text.replaceAll(';', '')
        console.log(text);
    
        console.log("split", text.split(' '));
    
    }
}


export { Utils };


