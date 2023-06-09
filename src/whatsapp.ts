// import type { Message } from './model/message';
import { magix, timeout, makeOptions } from './helpers/decrypt';
import { useragentOverride } from '../config/WAuserAgente';
import axios from 'axios';

export class Whatsapp {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(  ) {  }

  /**
   * Decrypts message file
   * @param message Message object
   * @returns Decrypted file buffer (null otherwise)
   */
  public async decryptFile(message: any) {
    const options = makeOptions(useragentOverride);
    message.clientUrl =
      message.clientUrl !== undefined
        ? message.clientUrl
        : message.deprecatedMms3Url;

    if (!message.clientUrl) {
      throw new Error(
        'message is missing critical data needed to download the file.'
      );
    }

    let haventGottenImageYet = true,
      res: any;
    try {
      while (haventGottenImageYet) {
        res = await axios.get(message.clientUrl.trim(), options);
        if (res.status == 200) {
          haventGottenImageYet = false;
        } else {
          await timeout(2000);
        }
      }
    } catch (error) {
      console.error(error);
      throw 'Error trying to download the file.';
    }
    const buff = Buffer.from(res.data, 'binary');
    return magix(buff, message.mediaKey, message.type, message.size);
  }
}