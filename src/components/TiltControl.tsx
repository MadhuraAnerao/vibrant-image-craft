
import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { RotateCw, RotateCcw } from 'lucide-react';

interface TiltControlProps {
  onChange: (tiltValue: number) => void;
}

const TiltControl = ({ onChange }: TiltControlProps) => {
  const [tiltValue, setTiltValue] = useState<number>(0);

  useEffect(() => {
    onChange(tiltValue);
  }, [tiltValue, onChange]);

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
    </div>
  );
};

export default TiltControl;
