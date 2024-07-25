import React from "react";

export const MainSidebar = (): JSX.Element => {
  return (
    <div className="relative w-14 h-[810px] bg-[#010256]">
      <div className="top-0 bg-[#010256] inline-flex items-start absolute left-0">
        <div className="inline-flex items-start pt-0 pb-12 px-0 relative flex-[0_0_auto]">
          <div className="relative w-14 h-[476px]">
            <div className="relative h-[106px] top-[7px]">
              <div className="absolute w-[34px] h-[34px] top-3 left-[11px] bg-[#020039] rounded-md overflow-hidden shadow-[0px_0px_0px_2px_#b4cfff]">
                <div className="relative h-[34px] rounded-md overflow-hidden border border-solid border-[#0000001a] bg-[url(/frame.svg)] bg-cover bg-[50%_50%]">
                  <img
                    className="w-[34px] h-[34px] top-0 object-cover absolute left-0"
                    alt="Rectangle"
                    src="rectangle.png"
                  />
                </div>
              </div>
              <img className="absolute w-10 h-10 top-[60px] left-2" alt="Frame" src="image.svg" />
            </div>
          </div>
          <div className="w-14 h-[70px] top-[406px] [background:linear-gradient(180deg,rgba(1,2,86,0)_0%,rgb(1,2,86)_100%)] absolute left-0" />
        </div>
      </div>
      <div className="flex-col justify-end gap-5 pt-2 pb-4 px-4 top-[718px] inline-flex items-start absolute left-0">
        <img className="relative w-6 h-6" alt="Frame" src="frame-2.svg" />
        <div className="relative w-6 h-6 bg-[#ff6d00] rounded-[999px] overflow-hidden">
          <div className="absolute w-[18px] h-3 top-[5px] left-[3px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#4c2103] text-[10px] text-center tracking-[0.40px] leading-3 whitespace-nowrap">
            MG
          </div>
        </div>
      </div>
    </div>
  );
};
