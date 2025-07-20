// nladsn/notes/index.js

// محتوای فایل‌های HTML به صورت متن خام وارد می‌شود
import pharma7 from './pharma/7.html';
import pharma8 from './pharma/8.html';
import pharma9 from './pharma/9.html';
import pharma10 from './pharma/10.html';
import pharma11 from './pharma/11.html';

import kidney1 from './kidney/1.html';

// جلسات درس infectious
import infectious1 from './infectious/1.html';
import infectious2 from './infectious/2.html';
import infectious3 from './infectious/3.html';
import infectious4 from './infectious/4.html';
import infectious5 from './infectious/5.html';
import infectious6 from './infectious/6.html';
import infectious7 from './infectious/7.html';
import infectious8 from './infectious/8.html';
import infectious9 from './infectious/9.html';

// یک آبجکت برای دسترسی آسان به هر جزوه می‌سازیم
export const notes = {
  'pharma/7': pharma7,
  'pharma/8': pharma8,
  'pharma/9': pharma9,
  'pharma/10': pharma10,
  'pharma/11': pharma11,
  'kidney/1': kidney1,
  'infectious/1': infectious1,
  'infectious/2': infectious2,
  'infectious/3': infectious3,
  'infectious/4': infectious4,
  'infectious/5': infectious5,
  'infectious/6': infectious6,
  'infectious/7': infectious7,
  'infectious/8': infectious8,
  'infectious/9': infectious9
};