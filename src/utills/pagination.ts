export function calcPagination(total: number, page = 1, limit = 10) { 
const pages = Math.max(1, Math.ceil(total / limit)); 
return { total, page, limit, pages, }; }