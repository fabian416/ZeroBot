'use client';

import { useEffect, useRef, useState } from 'react';
import { ZKPassport } from '@zkpassport/sdk';
import QRCode from 'react-qr-code';

const NEXT_PUBLIC_BASE_URL = process.env.VITE_PUBLIC_BASE_URL!;

export default function ZKPassportComponent({onClose}: any) {
  const [url, setUrl] = useState<string | null>(null);
  const [zkPassportData, setZkPassportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const zkpassportRef = useRef<ZKPassport | null>(null);

  useEffect(() => {
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
          console.log('✅ Proof generated');
        });

        onResult(async ({ verified, result }) => {
          console.log('🎯 Result received:', result);

          if (!verified) {
            console.error('❌ Proof verification failed');
            setLoading(false);
            return;
          }

          try {
            const passportData = {
              firstname: result.firstname?.disclose?.result ?? '',
              lastname: result.lastname?.disclose?.result ?? '',
              documentType: result.document_type?.disclose?.result ?? '',
              documentNumber: result.document_number?.disclose?.result ?? '',
            };


            console.log('🎫 zkPassport Data:', passportData);
            setZkPassportData(passportData);
          } catch (err) {
            console.error('❌ Error al enviar datos al backend:', err);
            setLoading(false);
          }
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

 return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          &times;
        </button>

        <p className="text-center text-black mb-6 mt-10">
          Since this is your first time using <strong>ZeroBot</strong>, we’ll verify your identity using <strong>zkPassport</strong>.
        </p>

        {loading ? (
          <p className="text-blue-600 font-semibold text-center">Processing zkPassport...</p>
        ) : url ? (
          <div className="flex justify-center">
            <QRCode value={url} size={256} />
          </div>
        ) : (
          <p className="text-gray-500 text-center">Loading...</p>
        )}
      </div>
    </div>
  );

}
