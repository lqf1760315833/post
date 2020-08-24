function Listener({
    scrollComment: scrollFn1,
    scrollCommentSec: scrollFn2,
    openModal: openFn,
    closeModal: closeFn
  }) {
    window.addEventListener('scroll', scrollFn1);
  
    document
      .querySelector('.modal .comment-list')
      .addEventListener('scroll', scrollFn2);
  
    document
      .querySelector('.detail .comment-list .box')
      .addEventListener('click', function(e) {
        if (
          e.target.className === 'reply' ||
          e.target.parentNode.className === 'reply'
        ) {
          openFn();
        }
      });
    document.querySelector('.modal .header').addEventListener('click', closeFn);
  }
  