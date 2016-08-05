BlazeComponent.extendComponent({
  mixins() {
    return [Mixins.InfiniteScrolling, Mixins.PerfectScrollbar];
  },

  calculateNextPeak() {
    const cardElement = this.find('.js-card-details');
    if (cardElement) {
      const altitude = cardElement.scrollHeight;
      this.callFirstWith(this, 'setNextPeak', altitude);
    }
  },

  editorOptions() {
    return {
      lineNumbers: true,
      mode: "htmlembedded",
      theme: "3024-night"
    };
  },

  reachNextPeak() {
    const activitiesComponent = this.childComponents('activities')[0];
    activitiesComponent.loadNextPage();
  },

  onCreated() {
    this.isLoaded = new ReactiveVar(false);
    this.parentComponent().showOverlay.set(true);
    this.parentComponent().mouseHasEnterCardDetails = false;
    this.calculateNextPeak();
  },

  isWatching() {
    const card = this.currentData();
    return card.findWatcher(Meteor.userId());
  },

  scrollParentContainer() {
    const cardPanelWidth = 510;
    const bodyBoardComponent = this.parentComponent();

    const $cardContainer = bodyBoardComponent.$('.js-lists');
    const $cardView = this.$(this.firstNode());
    const cardContainerScroll = $cardContainer.scrollLeft();
    const cardContainerWidth = $cardContainer.width();

    const cardViewStart = $cardView.offset().left;
    const cardViewEnd = cardViewStart + cardPanelWidth;

    let offset = false;
    if (cardViewStart < 0) {
      offset = cardViewStart;
    } else if(cardViewEnd > cardContainerWidth) {
      offset = cardViewEnd - cardContainerWidth;
    }

    if (offset) {
      bodyBoardComponent.scrollLeft(cardContainerScroll + offset);
    }
  },
  selectedLanguage() {
    var newLang = this.data().language;

    //this.$(".minicard-language-select").select2("destroy");
    //this.languageSelector.val(newLang);
    if(newLang)
      if (this.languageSelector)
        this.languageSelector.val(newLang).trigger("change");
    /*
    if (newLang)
      return newLang;
    else {
      var l = Cards.findOne({_id: Session.get('currentCard')._id}).language;
      if (l)
        return l;
    }
    */
    //var seenLang = Session.get('currentSeenLanguage');    
  },
  onRendered() {
    if (!Utils.isMiniScreen()) this.scrollParentContainer();
    var data = this.data();
    var language = data.language;
    var modes = [];
    for (key in CodeMirror.modes) {
      modes.push({id: key, text: key});
    }
    var languageSelector = this.$(".minicard-language-select").select2({
        data: modes
    });
    this.languageSelector = languageSelector;
    languageSelector.on("select2:select", function (e) { 
      var currentCard = Session.get('currentCard');
      var language = e.params.data.id;
      Cards.update(currentCard, {$set: {language: language}});
    });
    if (language) {
      languageSelector.val(language).trigger("change");
    }
    else {
      var card = Cards.findOne({_id: data._id});
      languageSelector.val(card.language).trigger("change");
    }
  },

  onDestroyed() {
    this.parentComponent().showOverlay.set(false);
  },

  events() {
    const events = {
      [`${CSSEvents.animationend} .js-card-details`]() {
        this.isLoaded.set(true);
      },
    };

    return [{
      ...events,
      'click .js-close-card-details'() {
        Utils.goBoardId(this.data().boardId);
      },
      'click .js-open-card-details-menu': Popup.open('cardDetailsActions'),
      'submit .js-card-description'(evt) {
        evt.preventDefault();
        const description = this.currentComponent().getValue();
        this.data().setDescription(description);
      },
      'submit .js-card-details-title'(evt) {
        evt.preventDefault();
        const title = this.currentComponent().getValue().trim();
        if (title) {
          this.data().setTitle(title);
        }
      },
      'click .js-member': Popup.open('cardMember'),
      'click .js-add-members': Popup.open('cardMembers'),
      'click .js-add-labels': Popup.open('cardLabels'),
      'mouseenter .js-card-details'() {
        this.parentComponent().showOverlay.set(true);
        this.parentComponent().mouseHasEnterCardDetails = true;
      },
      /*
      'click'(event) {

        //if (event.target.hasClass())
        console.log(this.data().language);
        //console.log($(event.target).hasClass("cm-bracket"));
      },
      */
    }];
  },
}).register('cardDetails');

// We extends the normal InlinedForm component to support UnsavedEdits draft
// feature.
(class extends InlinedForm {
  _getUnsavedEditKey() {
    return {
      fieldName: 'cardDescription',
      // XXX Recovering the currentCard identifier form a session variable is
      // fragile because this variable may change for instance if the route
      // change. We should use some component props instead.
      docId: Session.get('currentCard'),
    };
  }

  close(isReset = false) {
    if (this.isOpen.get() && !isReset) {
      const draft = this.getValue().trim();
      if (draft !== Cards.findOne(Session.get('currentCard')).description) {
        UnsavedEdits.set(this._getUnsavedEditKey(), this.getValue());
      }
    }
    super();
  }

  reset() {
    UnsavedEdits.reset(this._getUnsavedEditKey());
    this.close(true);
  }

  events() {
    const parentEvents = InlinedForm.prototype.events()[0];
    return [{
      ...parentEvents,
      'click .js-close-inlined-form': this.reset,
    }];
  }
}).register('inlinedCardDescription');

Template.cardDetailsActionsPopup.helpers({
  isWatching() {
    return this.findWatcher(Meteor.userId());
  },
});

Template.cardDetailsActionsPopup.events({
  'click .js-members': Popup.open('cardMembers'),
  'click .js-labels': Popup.open('cardLabels'),
  'click .js-attachments': Popup.open('cardAttachments'),
  'click .js-move-card': Popup.open('moveCard'),
  'click .js-archive'(evt) {
    evt.preventDefault();
    this.archive();
    Popup.close();
  },
  'click .js-more': Popup.open('cardMore'),
  'click .js-toggle-watch-card'() {
    const currentCard = this;
    const level = currentCard.findWatcher(Meteor.userId()) ? null : 'watching';
    Meteor.call('watch', 'card', currentCard._id, level, (err, ret) => {
      if (!err && ret) Popup.close();
    });
  },
});

Template.editCardTitleForm.onRendered(function() {
  autosize(this.$('.js-edit-card-title'));
});

Template.editCardTitleForm.events({
  'keydown .js-edit-card-title'(evt) {
    // If enter key was pressed, submit the data
    if (evt.keyCode === 13) {
      $('.js-submit-edit-card-title-form').click();
    }
  },
});

Template.moveCardPopup.events({
  'click .js-select-list'() {
    // XXX We should *not* get the currentCard from the global state, but
    // instead from a “component” state.
    const card = Cards.findOne(Session.get('currentCard'));
    const newListId = this._id;
    card.move(newListId);
    Popup.close();
  },
});

Template.cardMorePopup.events({
  'click .js-delete': Popup.afterConfirm('cardDelete', function() {
    Popup.close();
    Cards.remove(this._id);
    Utils.goBoardId(this.boardId);
  }),
});

// Close the card details pane by pressing escape
/*
EscapeActions.register('detailsPane',
  () => { Utils.goBoardId(Session.get('currentBoard')); },
  () => { return !Session.equals('currentCard', null); }, {
    noClickEscapeOn: '.js-card-details,.board-sidebar,#header',
  }
);
*/