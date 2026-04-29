import { QRCodeCanvas } from 'qrcode.react';
import { useState } from 'react';

//  interface StructQr {
//     type: string;
//     id: number;
//     user: number;
//     timestamp: Date;
//   }

function QrCode() {
  const [code, setCode] = useState({});

  const generate = () => {
    //generate a ramdom StructQr  
    setCode({
      type: "abcdefghijklmnopqrstuvwxyz".split("")[Math.floor(Math.random() * 26)],
      id: Math.floor(Math.random() * 1000),
      user: Math.floor(Math.random() * 1000),
      timestamp: new Date(),
    });
  }


  return (
    <>
      <div>
        <QRCodeCanvas value={JSON.stringify(code)} size={256} />
      </div>
      <div>
        <button className='btn btn-accent mt-2' onClick={generate} >Random</button>
      </div>
    </>

  );
}

export default QrCode;