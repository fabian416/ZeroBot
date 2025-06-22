'use client';

import { useEffect, useRef, useState } from 'react';
import { ZKPassport } from '@zkpassport/sdk';
import QRCode from 'react-qr-code';

const NEXT_PUBLIC_BASE_URL = process.env.VITE_PUBLIC_BASE_URL!;

export default function ZKPassportComponent({onClose, contractAddress, createIdentity, getPrivateIdentity}: any) {
  const [url, setUrl] = useState<string | null>(null);
  const [zkPassportData, setZkPassportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const zkpassportRef = useRef<ZKPassport | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const passportData = {
        firstname: convertStringToBigInt('asjdlfñjka'),
        lastname: convertStringToBigInt('aksjdjf'),
        documentType: convertStringToBigInt('passport'),
        documentNumber: convertStringToBigInt('1234567890'),
      };

      const user = await createIdentity(contractAddress, passportData);
      console.log(user);
      await getPrivateIdentity(contractAddress, user);
    }

    getUser();

    const runZkPassport = async () => {
      setLoading(true);

      try {
        if (!zkpassportRef.current) {
          zkpassportRef.current = new ZKPassport();
        }

        const queryBuilder = await zkpassportRef.current.request({
          name: 'ZeroBot Demo',
          logo: `${NEXT_PUBLIC_BASE_URL}/logo.png`,
          purpose: 'Verify your identity using zkPassport',
          scope: 'identity-verification',
          devMode: true,
        });

        const {
          url,
          requestId,
          onRequestReceived,
          onGeneratingProof,
          onProofGenerated,
          onResult,
          onReject,
          onError,
        } = queryBuilder
          .disclose('firstname')
          .disclose('lastname')
          .disclose('document_type')
          .disclose('document_number')
          .done();

        setUrl(url);
        setLoading(false); // listo para mostrar QR

        onRequestReceived(() => console.log('📩 Request received by user'));
        onGeneratingProof(() => {
          console.log('🔄 Generating proof...');
          setLoading(true);
        });

        onProofGenerated((proof) => {
          console.log('✅ Proof generated', proof);
        });

        onResult(async ({ verified, result }) => {
          console.log('🎯 Result received:', result);
/*
          if (!verified) {
            console.error('❌ Proof verification failed');
            setLoading(false);
            return;
          }
*/
            const passportData = {
              firstname: convertStringToBigInt(result.firstname?.disclose?.result ?? 'asjdlfñjka'),
              lastname: convertStringToBigInt(result.lastname?.disclose?.result ?? 'aksjdjf'),
              documentType: convertStringToBigInt(result.document_type?.disclose?.result ?? 'passport'),
              documentNumber: convertStringToBigInt(result.document_number?.disclose?.result ?? '1234567890'),
            };
            
            const user = await createIdentity(contractAddress, passportData);
            console.log(user);
            await getPrivateIdentity(contractAddress, user);

            console.log('🎫 zkPassport Data:', passportData);
            setZkPassportData(passportData);
     
        });

        onReject(() => {
          console.warn('❌ User rejected the request');
          setLoading(false);
        });

        onError((err) => {
          console.error('💥 Error:', err);
          setLoading(false);
        });
      } catch (e) {
        console.error('💥 Init error:', e);
        setLoading(false);
      }
    };

    runZkPassport();
  }, []);

  const convertStringToBigInt = (value: string) => {
    return BigInt('0x' + Buffer.from(value).toString('hex'));
  }

 return (
    <div className=" text-gray-800 rounded-2xl shadow-2xl p-6 max-w-lg w-full relative neon-shadow flex flex-col items-center space-y-4">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-300 hover:text-gray-700 text-xl bg-transparent border-none outline-none p-2"
        aria-label="Close"
      >
        &times;
      </button>

      <p className="text-center text-md font-medium text-gray-300 pt-10">
        Since this is your first time using <strong>ZeroBot</strong>, we’ll verify your identity using <strong>zkPassport</strong>.
      </p>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 w-full">
          <div className="loading-spinner border-blue-500 border-t-transparent" />
          <p className="text-blue-600 font-semibold text-center mt-4">Processing zkPassport...</p>
        </div>
      ) : url ? (
        <div className="p-4 bg-white rounded-lg border-4 border-gray-100 shadow-inner">
          <QRCode value={url} size={240} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 w-full">
          <p className="text-gray-500 text-center">Initializing QR Code...</p>
        </div>
      )}
    </div>
  );
}
