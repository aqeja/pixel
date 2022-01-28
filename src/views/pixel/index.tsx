import React, { useState, useRef, useCallback } from "react";
import ImgIcon from "../../assets/img.svg";
import RetinaCanvas from "../../components/RetinaCanvas";
const devicePixelRatio = window.devicePixelRatio;
function sleep(duration: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

const Picker: React.FC<React.HTMLProps<HTMLDivElement>> = ({ className = "", children, type, ...rest }) => {
  return (
    <div
      className={`cursor-default flex justify-center items-center border border-dotted bg-gray-50 rounded-lg text-gray-600 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
const Pixel = () => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [step, setStep] = useState(20);
  const pickerRef = useRef<HTMLInputElement | null>(null);
  const [resultImg, setResultImg] = useState("");
  const lock = useRef<number | null>(null);
  const [imgSource, setImgSource] = useState("");
  const [borderColor, setBorderColor] = useState("rgba(0,0,0,0)");
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const render = useCallback(() => {
    if (lock.current) {
      clearTimeout(lock.current);
    }
    lock.current = window.setTimeout(async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas?.getContext("2d");
      if (!imgRef.current || !ctx || !canvas) return;
      const { naturalWidth: width, naturalHeight: height } = imgRef.current;

      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;

      setLoading(true);
      const GAP = step;
      for (let h = 0; h < height; h += GAP) {
        for (let w = 0; w < width; w += GAP) {
          if (!imgRef.current) return;
          const params: [number, number, number, number] = [
            w * devicePixelRatio,
            h * devicePixelRatio,
            GAP * devicePixelRatio,
            GAP * devicePixelRatio,
          ];
          ctx.drawImage(imgRef.current, w, h, 1, 1, ...params);
          // ctx.lineWidth = 1;
          ctx.strokeStyle = borderColor;
          ctx.strokeRect(...params);
        }
      }
      const src = canvasRef.current?.toDataURL() || "";
      setResultImg(src);
      await sleep(100); // render takes some time
      setLoading(false);
    }, 100);
  }, [step, borderColor]);
  const onStepChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setStep(Number(e.target.value));
      render();
    },
    [render],
  );
  const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    setLoading(true);
    setImgSource(URL.createObjectURL(file));
  }, []);
  return (
    <div className={`h-screen  flex flex-col ${imgSource ? "bg-gray-50" : "bg-white"}`}>
      <header className={`flex items-center shadow bg-white sticky top-0 py-2 px-4 ${imgSource ? "" : "invisible"}`}>
        <img src="site.png" className="w-10" alt="" />
      </header>
      <div className="flex-grow mt-10 flex items-center justify-center">
        <div className={`${imgSource ? "" : "invisible"}`}>
          <div className="flex justify-center items-end">
            <img
              src={imgSource}
              alt=""
              className="object-contain object-bottom"
              onClick={() => {
                pickerRef.current?.click();
              }}
              style={{
                width: 300,
                height: 300,
              }}
              ref={imgRef}
              onLoad={render}
            />
            <div className="relative ml-20">
              <span
                style={{
                  fontFamily: "'Press Start 2P'",
                }}
                className={`absolute left-1/2 -translate-x-1/2 top-2 shadow-sm backdrop-filter backdrop-blur bg-gray-700 bg-opacity-40 text-xs text-white rounded font-medium py-1 px-2 ${
                  loading ? "" : "invisible"
                }`}
              >
                loading...
              </span>
              <img
                className="object-contain object-bottom"
                src={resultImg || imgSource}
                alt=""
                style={{
                  width: 500,
                  height: 500,
                }}
              />
            </div>
          </div>
          <div className="mt-10 pt-10 border-t border-solid justify-center flex items-center">
            <div className="mx-6">
              <p className="text-xs text-gray-400 mb-1">格子尺寸</p>
              <input type="range" min={1} max={100} step={1} value={step} onChange={onStepChange} />
            </div>
            <div className="mx-6 hidden">
              <p className="text-xs text-gray-400 mb-1">边框颜色</p>
              <input
                type="color"
                value={borderColor}
                onChange={(e) => {
                  setBorderColor(e.target.value);
                  render();
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${imgSource ? "invisible" : ""}`}>
        <h1
          style={{
            fontFamily: "chn-pixel",
          }}
          className="text-5xl mb-10 text-[#f19300] text-center"
        >
          像素化你的图片
        </h1>
        <img src="pic.png" alt="" />

        <Picker
          className="mt-10 mx-auto w-60 h-12 px-6 bg-gray-700 !text-white !border-none"
          onClick={() => {
            pickerRef.current?.click();
          }}
          style={{
            fontFamily: "chn-pixel",
          }}
        >
          选择一张图片
        </Picker>
      </div>

      <footer
        className={`flex justify-center items-center p-5 bg-white shadow ${imgSource ? "" : "invisible"}`}
        style={{
          fontFamily: "chn-pixel",
        }}
      >
        <label>
          <Picker className="w-36 h-12">
            <img src={ImgIcon} className="w-6 mr-2" alt="" />
            更换图片
          </Picker>
          <input type="file" onChange={onFileChange} hidden ref={pickerRef} accept="image/*" />
        </label>

        <a
          href={resultImg}
          download={file?.name || "file.png"}
          className="ml-6 h-12 inline-flex items-center justify-center px-6 rounded-lg text-white bg-gray-700 font-medium"
        >
          保存到本地
        </a>
      </footer>
      <RetinaCanvas ref={canvasRef} hidden />
    </div>
  );
};
export default Pixel;
