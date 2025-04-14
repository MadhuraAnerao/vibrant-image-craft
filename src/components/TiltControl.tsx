
import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { RotateCw, RotateCcw, AlertOctagon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TiltControlProps {
  onChange: (tiltValue: number) => void;
}

const TiltControl = ({ onChange }: TiltControlProps) => {
  const [tiltValue, setTiltValue] = useState<number>(0);
  const [deviceTiltDetected, setDeviceTiltDetected] = useState<boolean>(false);

  useEffect(() => {
    onChange(tiltValue);
  }, [tiltValue, onChange]);

  useEffect(() => {
    // Device orientation detection for physical tilt
    if (window.DeviceOrientationEvent) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        // Beta represents front-to-back tilt
        if (event.beta !== null && Math.abs(event.beta) > 45) {
          if (!deviceTiltDetected) {
            setDeviceTiltDetected(true);
            toast({
              title: "Device Tilted!",
              description: "We detected that you tilted your device significantly.",
              icon: <AlertOctagon className="h-5 w-5 text-amber-500" />,
              duration: 3000,
            });
            
            // Reset the detection flag after some time
            setTimeout(() => {
              setDeviceTiltDetected(false);
            }, 5000);
          }
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);
      
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
      };
    } else {
      console.log('Device orientation not supported on this device');
    }
  }, [deviceTiltDetected]);

  const handleSliderChange = (value: number[]) => {
    setTiltValue(value[0]);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Tilt Image</h3>
      <div className="flex items-center space-x-2">
        <RotateCcw className="w-4 h-4 text-gray-400" />
        <Slider
          defaultValue={[0]}
          min={-45}
          max={45}
          step={1}
          value={[tiltValue]}
          onValueChange={handleSliderChange}
          className="flex-1"
        />
        <RotateCw className="w-4 h-4 text-gray-400" />
      </div>
      <div className="text-center text-sm">{tiltValue}°</div>
      
      <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
        <p className="text-xs flex items-center">
          <AlertOctagon className="h-4 w-4 mr-1 inline" />
          Tilt your physical device to see a popup notification!
        </p>
      </div>
    </div>
  );
};

export default TiltControl;
