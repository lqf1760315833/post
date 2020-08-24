/**
 * 格式化时间
 * @param {*} date
 */
function formatTime(date) {
    let delta = new Date().getTime() - date.getTime();
    let second = Math.ceil(Math.abs(delta) / 1000);
    if (second < 60) {
      return `${second}秒前`;
    } else if (second < 60 * 60) {
      let minute = Math.ceil(second / 60);
      return `${minute}分钟前`;
    } else if (second < 60 * 60 * 24) {
      let hour = Math.ceil(second / (60 * 60));
      return `${hour}小时前`;
    } else if (second < 60 * 60 * 24 * 2) {
      return `昨天`;
    } else if (second < 60 * 60 * 24 * 5) {
      let day = Math.ceil(second / (60 * 60 * 24));
      return `${day}天前`;
    } else {
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    }
  }
  
  /**
   * 时间字符串转为时间对象
   * @param {*} str
   */
  function parseUTC(str) {
    const arr = str.split(/[-+ :T]/);
    const date = new Date();
    date.setUTCFullYear(+arr[0]);
    date.setUTCMonth(+arr[1] - 1);
    date.setUTCDate(+arr[2]);
    date.setUTCHours(+arr[3]);
    date.setUTCMinutes(+arr[4]);
    date.setUTCSeconds(+arr[5]);
    return date;
    return new Date(str);
  }
  
  /**
   * 判断元素是否在适口中
   * @param {*} el
   */
  function elInViewPort(el) {
    const client = el.getBoundingClientRect();
    return !(
      client.top >= document.documentElement.clientHeight || client.bottom <= 0
    );
  }
  
  /**
   * 禁止div.detail的滚动
   */
  function preventDocScroll(selector) {
    const detail = document.querySelector(selector);
    docScrollTop = document.body.scrollTop + document.documentElement.scrollTop;
    detail.style.top = `${-docScrollTop}px`;
    detail.style.position = 'fixed';
    return docScrollTop;
  }
  
  /**
   * 打开div.detail的滚动
   */
  function resetDocScroll(selector, docScrollTop) {
    const detail = document.querySelector(selector);
    detail.style.position = 'unset';
    window.scrollTo(0, docScrollTop);
  }
  