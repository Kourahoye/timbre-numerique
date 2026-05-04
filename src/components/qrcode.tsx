import { QRCodeCanvas } from 'qrcode.react';

function QrCode() {

  return (
    <>
      <div className='text-center'>
        <QRCodeCanvas value={"Bienvenue sur notre site vente de timbres numerique"} size={256} />
      </div>
    </>

  );
}

export default QrCode;