'use client';

import React, { useRef, useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CameraOff, ScanLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function ScanQrPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push("/login");
      return;
    }

    const getCameraPermission = async () => {
      if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Camera API not supported in this browser.');
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Unsupported Browser',
          description: 'Your browser does not support camera access.',
        });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to scan QR codes.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [toast]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Scan & Pay"
        description="Point your camera at a QR code to make a payment."
      />
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="relative aspect-square w-full bg-muted rounded-md flex items-center justify-center overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
                <CameraOff className="size-16 mb-4" />
                <h3 className="text-xl font-semibold">Camera Blocked</h3>
                <p className="text-center text-muted-foreground">Allow camera access to scan QR codes.</p>
              </div>
            )}
            {hasCameraPermission === true && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-white/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
                <ScanLine className="absolute w-64 h-auto text-white/70 animate-pulse" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {
        hasCameraPermission === false && (
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertTitle>Camera Access Required</AlertTitle>
            <AlertDescription>
              Please go to your browser settings and grant permission for this site to access your camera.
            </AlertDescription>
          </Alert>
        )
      }

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => {
            toast({ title: "QR Scanned!", description: "Redirecting to payment..." });
            // In a real app, we'd parse the QR content. Here we mock it.
            // We'll redirect to send-money but we haven't implemented query param handling there yet.
            // For now, just redirect.
            // Simulate scanning a merchant QR code
            window.location.href = "/send-money?recipientId=shop@paythm&amount=150";
          }}
        >
          Simulate Scan (Dev Only)
        </Button>
      </div>
    </div >
  );
}
