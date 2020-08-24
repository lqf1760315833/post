function Render() {
    this.postId = 'a404f';
    this.defaultAvatar = './images/avatar-default.jpg';
    this.isLoading = false;
    this.docScrollTop = 0;
    this.selectComment = null;
    this.commentPage = {
      post: undefined,
      pageSize: 5,
      currentPage: 1,
      totalItem: -1,
      commentList: [],
      container: '.detail > .comment-list .box',
      needReply: true,
      avatarSize: 60
    };
    this.commentSecPage = {
      comment: undefined,
      pageSize: 5,
      currentPage: 1,
      totalItem: -1,
      commentList: [],
      container: '.modal .container .box',
      needReply: false,
      avatarSize: 50
    };
  
    this.network = new Network();
    let self = this;
    this.listener = new Listener({
      scrollComment: function() {
        self.loadMore(self.commentPage, '.detail > .comment-list .no-more');
      },
      scrollCommentSec: function() {
        self.loadMore(self.commentSecPage, '.modal .no-more', true);
      },
      openModal: function() {
        self.openModal(this.selectComment);
      },
      closeModal: function() {
        self.closeModal();
      }
    });
  
    this.initPost();
    this.initCommentList(this.commentPage);
  }
  
  Render.prototype.initPost = function() {
    let self = this;
    this.network.get(`/post/get?id=${this.postId}`, {
      render: function(data) {
        if (data) {
          const core = document.querySelector('.detail__core');
          const children = [
            self.initAuthor(data.ownerAccount, 70),
            ...self.initContent(data),
            self.initActions(data, core)
          ];
          children.forEach(child => core.appendChild(child));
        }
      }
    });
  };
  
  /**
   * 分页加载评论列表
   * @param {*} page
   * @param {*} param1
   */
  Render.prototype.initCommentList = function(page, { nest } = { nest: false }) {
    let search = `?postId=${this.postId}&pageSize=${page.pageSize}&currentPage=${page.currentPage}`;
    if (page.comment) {
      search += `&commentId=${page.comment.id}`;
    }
  
    let self = this;
    this.network.get(`/comment/querywithpage${search}`, {
      render: function(data, myJson) {
        if (data) {
          const container = document.querySelector(page.container);
          page.totalItem = myJson.totalItem;
          page.commentList = [...page.commentList, ...data];
          data.forEach(comment =>
            container.appendChild(
              self.initComment(comment, {
                needReply: page.needReply,
                avatarSize: page.avatarSize,
                nest
              })
            )
          );
          self.isLoading = false;
        }
      }
    });
  };
  
  /**
   * 打开二级回复框
   */
  Render.prototype.openModal = function() {
    this.docScrollTop = preventDocScroll('.detail');
    document.querySelector('.modal').classList.remove('none');
  
    this.initModalComment(this.selectComment);
    this.initModalCommentSec(this.selectComment);
  };
  
  /**
   * 关闭二级回复框
   */
  Render.prototype.closeModal = function() {
    resetDocScroll('.detail', this.docScrollTop);
    document.querySelector('.modal').classList.add('none');
    document.querySelector('.modal .comment-list').innerHTML = `
      <div class="box"></div>
      <div class="no-more">
        我可是有底线的哦～
      </div>
    `;
    this.resetPage(this.commentSecPage);
  };
  
  /**
   * 重置 page
   * @param {*} page
   */
  Render.prototype.resetPage = function(page) {
    const pageInfo = {
      pageSize: 5,
      currentPage: 1,
      totalItem: -1
    };
    for (let key in page) {
      if (key === 'container') {
        continue;
      } else if (typeof page[key] !== 'object') {
        page[key] = pageInfo[key];
      } else if (Array.isArray(page[key])) {
        page[key] = [];
      } else {
        page[key] = undefined;
      }
    }
  };
  
  /**
   * 拉到底加载更多
   * @param {*} page page参数
   * @param {*} commentList
   * @param {*} callback
   * @param {*} basis
   */
  Render.prototype.loadMore = function(page, basis, nest) {
    if (this.isLoading) {
      return page;
    }
    if (page.totalItem <= page.commentList.length) {
      return page;
    }
    if (elInViewPort(document.querySelector(basis))) {
      page.currentPage++;
      this.isLoading = true;
      this.initCommentList(page, { nest: !!nest });
    }
    return page;
  };
  
  /**
   * 创建弹框一级评论
   * @param {*} comment
   */
  Render.prototype.initModalComment = function(comment) {
    const box = document.querySelector('.modal .box');
    const divider = this.createEl('div', {
      innerHTML: `${comment.replyNum}条回复`,
      attributes: {
        class: 'divider'
      }
    });
    document
      .querySelector('.modal .comment-list')
      .insertBefore(this.initComment(comment, { needReply: false }), box);
    document.querySelector('.modal .comment-list').insertBefore(divider, box);
  };
  
  /**
   * 创建弹框二级评论列表
   * @param {*} comment
   */
  Render.prototype.initModalCommentSec = function(comment) {
    this.commentSecPage.comment = comment;
    this.initCommentList(this.commentSecPage, { nest: true });
  };
  
  /**
   * 创建一条评论
   * @param {*} comment
   */
  Render.prototype.initComment = function(
    comment,
    { needReply, avatarSize, nest } = {
      needReply: true,
      avatarSize: 60,
      nest: false
    }
  ) {
    const author = this.initAuthor(comment.ownerAccount, avatarSize);
    const content = this.initContent(comment, nest);
    const reply =
      needReply && comment.replyNum
        ? this.initReply(comment)
        : this.createEl('span');
    const info = this.initCommentInfo(comment);
    const floor = comment.floor
      ? this.initFloor(comment.floor)
      : this.createEl('span');
    return this.createEl('div', {
      attributes: { class: ['item'] },
      children: [author, ...content, info, reply, floor]
    });
  };
  
  /**
   * 创建楼层信息
   * @param {*} comment
   */
  Render.prototype.initFloor = function(floor) {
    return this.createEl('span', {
      innerHTML: `${floor}楼`,
      attributes: { class: ['floor'] }
    });
  };
  
  /**
   * 创建评论回复按钮
   * @param {*} comment
   */
  Render.prototype.initReply = function(comment) {
    const innerHTML = `
        <span>共${comment.replyNum}条回复</span>
        <i class="icon arrow-right"></i>
      `;
    const replyBtn = this.createEl('div', {
      innerHTML,
      attributes: { class: ['reply'] }
    });
    this.selectComment = comment;
    return replyBtn;
  };
  
  /**
   * 创建评论信息，时间、点赞数
   * @param {*} comment
   */
  Render.prototype.initCommentInfo = function(comment) {
    const actionInnerHTML = `
      <div class="support">
        <i class="post-up"></i>
        <span>${comment.supportNum}</span>
      </div>
      <div class="oppose">
        <i class="post-down"></i>
        <span>${comment.opposeNum}</span>
      </div>
    `;
    const actions = this.createEl('div', {
      innerHTML: actionInnerHTML,
      attributes: {
        class: ['actions']
      }
    });
    const time = this.createEl('div', {
      innerHTML: formatTime(parseUTC(comment.gmtCreated)),
      attributes: {
        class: ['time']
      }
    });
    return this.createEl('div', {
      attributes: { class: ['time-actions'] },
      children: [time, actions]
    });
  };
  
  /**
   * 创建帖子信息，所属圈子、回复数、点赞数
   * @param {*} data
   * @param {*} core
   */
  Render.prototype.initActions = function(data, core) {
    const innerHTML = `
        <div class="postgroup">java</div> 
          <div class="actions">
            <span class="reply-num">${data.replyNum}回复</span>
            <div class="up-down">
              <div class="down">
                <i class="icon thumb-down"></i>
              </div>
              <div class="line"></div>
              <div class="up">
                <i class="icon thumb-up"></i>
                <span class="num">${data.supportNum}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    return this.createEl('div', {
      innerHTML,
      attributes: { class: ['postgroup-actions'] }
    });
  };
  
  /**
   * 创建帖子或评论内容
   * @param {*} data
   */
  Render.prototype.initContent = function(data, nest = false) {
    let title, content, innerHTML;
    if (data.title) {
      title = this.createEl('div', {
        innerHTML: data.title,
        attributes: { class: ['title'] }
      });
    }
    if (nest) {
      const nameIdx = data.content.indexOf('?name=');
      const contentIdx = data.content.indexOf('?content=');
      if (nameIdx !== -1 && contentIdx !== -1) {
        const mainContent = data.content.substring(0, nameIdx);
        const name = data.content.substring(
          nameIdx + '?name='.length,
          contentIdx
        );
        const content = data.content.substring(contentIdx + '?content='.length);
        innerHTML = `${mainContent}//<span style="color:#2F93FE">@${name}：</span>${content}`;
      } else {
        innerHTML = data.content;
      }
    }
    content = this.createEl('div', {
      innerHTML: nest ? innerHTML : data.content,
      attributes: { class: ['content'] }
    });
    return title ? [title, content] : [content];
  };
  
  /**
   * 创建用户信息，头像、昵称
   * @param {*} account
   * @param {*} size
   */
  Render.prototype.initAuthor = function(account, size) {
    const avatar = this.createEl('img', {
      attributes: {
        class: ['avatar', `size-${size}`],
        src: (account && account.user.avatar) || this.defaultAvatar
      }
    });
    const nick = this.createEl('span', {
      innerHTML: (account && account.user.nick) || '佚名',
      attributes: { class: ['name'] }
    });
    return this.createEl('div', {
      attributes: { class: ['author'] },
      children: [avatar, nick]
    });
  };
  
  /**
   * 创建元素
   * @param {*} nodeName
   * @param {*} param1
   */
  Render.prototype.createEl = function(
    nodeName,
    { innerHTML, attributes, children } = {}
  ) {
    let el;
    if (nodeName.toLowerCase() === 'img') {
      el = new Image();
    } else {
      el = document.createElement(nodeName);
    }
  
    if (innerHTML) {
      el.innerHTML = innerHTML;
    }
  
    if (attributes) {
      for (let key in attributes) {
        const isArray = Array.isArray(attributes[key]);
        el.setAttribute(
          key,
          isArray ? attributes[key].join(' ') : attributes[key]
        );
      }
    }
  
    if (children) {
      children.forEach(child => el.appendChild(child));
    }
    return el;
  };
  