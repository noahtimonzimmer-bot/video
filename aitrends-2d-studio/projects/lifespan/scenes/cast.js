// cast.js — yellow figures (style "eden"); one signature item each.
export const ADAM = { top: 'none', head: 'curly' };
export const EVE = { top: 'none', head: 'ponytail', headColor: '#e05a8a' };
export const ADAM_SKIN = { top: 'tshirt', color: '#8a6a48', head: 'curly' };          // after the fall: garments of skin
export const EVE_SKIN = { top: 'dress', color: '#8a6a48', head: 'ponytail', headColor: '#e05a8a' };
export const MOSES = { top: 'trench', color: '#8a5a3a', head: 'none' };
export const JOSEPH = { top: 'suit', color: '#3a6ea5', color2: '#f2e6c8', head: 'none' };
export const ISAIAH = { top: 'trench', color: '#6a6a7a', head: 'none' };
export const KING = { top: 'suit', color: '#6a3a9a', color2: '#ffd47e', head: 'none' };
export const JOHN = { top: 'labcoat', head: 'bun' };
export const PAUL = { top: 'trench', color: '#3a7a4a', head: 'none' };
export const ISRAELITE = (i) => ({ top: ['dress', 'trench', 'tshirt'][i % 3], color: ['#9a6a42', '#c89a5a', '#7a5a3a', '#b87a4a'][i % 4], head: i % 4 === 1 ? 'ponytail' : 'none', headColor: '#b85a3a' });
