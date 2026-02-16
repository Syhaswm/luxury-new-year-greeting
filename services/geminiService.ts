import { GreetingResponse } from "../types";

// 预置本地新年祝福，不再调用任何在线 / 谷歌 API
const LOCAL_GREETINGS: GreetingResponse[] = [
  {
    title: "喜气洋洋",
    lines: [
      "烟花璀璨映红妆",
      "岁月峥嵘又一章",
      "福星高照财源广",
      "阖家欢乐万年长",
    ],
    luckyWord: "福",
  },
  {
    title: "龙腾四海",
    lines: [
      "金龙起舞迎新岁",
      "瑞气盈门照堂前",
      "鸿运当头添喜悦",
      "前程似锦步步连",
    ],
    luckyWord: "龙",
  },
  {
    title: "财源广进",
    lines: [
      "门迎紫气纳千祥",
      "户映金光添吉昌",
      "广进财源连四海",
      "笑看春风满华堂",
    ],
    luckyWord: "财",
  },
  {
    title: "阖家安康",
    lines: [
      "春暖花开盈庭院",
      "笑语欢声绕膝前",
      "人寿年丰多顺遂",
      "家和万事保平安",
    ],
    luckyWord: "安",
  },
  {
    title: "学业有成",
    lines: [
      "笔落生辉题锦卷",
      "勤耕不辍筑华年",
      "前路星辰皆可摘",
      "蟾宫折桂好少年",
    ],
    luckyWord: "智",
  },
];

export const generateBlessing = async (): Promise<GreetingResponse> => {
  const index = Math.floor(Math.random() * LOCAL_GREETINGS.length);
  return LOCAL_GREETINGS[index];
};