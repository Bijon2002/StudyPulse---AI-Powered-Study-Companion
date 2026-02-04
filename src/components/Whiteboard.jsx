import { useRef, useEffect, useState } from 'react';
import { Pencil, Square, Circle, Type, Eraser, Trash2, Download, Undo, Redo } from 'lucide-react';

export default function Whiteboard({ roomId }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#2563eb');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('pencil'); // pencil, eraser

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    canvas.style.width = `${canvas.offsetWidth}px`;
    canvas.style.height = `${canvas.offsetHeight}px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;

    // Load saved drawing if exists
    const saved = localStorage.getItem(`whiteboard_${roomId}`);
    if (saved) {
      const img = new Image();
      img.onload = () => context.drawImage(img, 0, 0, canvas.width/2, canvas.height/2);
      img.src = saved;
    }
  }, [roomId]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    contextRef.current.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    contextRef.current.lineWidth = brushSize;
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    
    // Auto-save to localstorage for persistence in this "room"
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    localStorage.setItem(`whiteboard_${roomId}`, dataUrl);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem(`whiteboard_${roomId}`);
  };

  const download = () => {
    const link = document.createElement('a');
    link.download = `whiteboard-${roomId}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const tools = [
    { id: 'pencil', icon: Pencil, label: 'Pencil' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
  ];

  const colors = ['#000000', '#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea'];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-4">
          <div className="flex bg-white rounded-lg border border-slate-200 p-1">
            {tools.map(t => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={`p-2 rounded-md transition-all ${tool === t.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                title={t.label}
              >
                <t.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-3 border-l border-slate-200">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-slate-400' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 px-3 border-l border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Size</span>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24 accent-blue-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={download}
            className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-100 transition-all"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={clearCanvas}
            className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-100 transition-all"
            title="Clear All"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative cursor-crosshair box-border">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          className="w-full h-full block"
        />
      </div>

      <div className="p-2 bg-slate-50 border-t border-slate-100 flex justify-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Real-time Collaborative Canvas Active</p>
      </div>
    </div>
  );
}
