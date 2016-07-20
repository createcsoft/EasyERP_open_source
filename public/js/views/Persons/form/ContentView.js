define([
    'Backbone',
    'jQuery',
    'Underscore',
    'views/listViewBase',
    'text!templates/Persons/form/ContentTemplate.html',
    'text!templates/Persons/form/ListItemTemplate.html',
    'models/PersonsModel',
    'views/Persons/form/FormView',
    'views/Persons/CreateView',
    'views/Persons/list/ListItemView',
    'views/Filter/filterView',
    'common',
    'constants',
    'dataService'
], function (Backbone, $, _, ListViewBase, ContentTemplate, ListItemTemplate, PersonsModel, FormView, CreateView, ListItemView, FilterView, common, CONSTANTS, dataService) {
    'use strict';

    var PersonsListView = ListViewBase.extend({
        listTemplate   : _.template(ListItemTemplate),
        contentTemplate: _.template(ContentTemplate),
        CreateView     : CreateView,
        ListItemView   : ListItemView,
        FilterView     : FilterView,
        listUrl        : 'easyErp/Persons/list/',
        contentType    : 'Persons', // needs in view.prototype.changeLocationHash
        viewType       : 'tform', // needs in view.prototype.changeLocationHash
        exportToXlsxUrl: '/Customers/exportToXlsx/?type=Persons',
        exportToCsvUrl : '/Customers/exportToCsv/?type=Persons',
        letterKey      : 'name.first',
        hasPagination  : true,
        hasAlphabet    : false,
        formView       : null,
        selectedId     : null,

        events: {
            'click .compactView:not(.checkbox)': 'renderFormView',
            'click .closeBtn'                  : 'returnToList',
            'click #sortBy'                    : 'openSortDrop'
        },

        initialize: function (options) {
            var modelId = options.modelId;

            this.mId = CONSTANTS.MID[this.contentType];
            this.startTime = options.startTime;
            this.collection = options.collection;
            this.filter = options.filter;
            this.sort = options.sort;
            this.defaultItemsNumber = this.collection.namberToShow || 100;
            this.newCollection = options.newCollection;
            this.deleteCounter = 0;
            this.page = options.collection.currentPage;

            ListViewBase.prototype.initialize.call(this, options);

            //modelId = this.collection.at(0).id;

            this.renderFormView(modelId);
        },

        openSortDrop: function (e) {
            var $target = $(e.target);

            e.preventDefault();

            $target.closest('.dropDown').toggleClass('open');
        },

        returnToList: function (e) {
            var currentPage = this.collection.currentPage;
            var count = this.collection.pageSize;
            var url;
            var filter;
            e.preventDefault();

            url = this.listUrl + 'p=' + currentPage + '/c=' + count;

            if (this.filter) {
                filter = encodeURI(JSON.stringify(this.filter));
                url += '/filter=' + filter;
            }

            Backbone.history.navigate(url, {trigger: true});

            $('#top-bar').removeClass('position');
        },

        goSort: function (e) {
            var filter = this.filter || {};
            var $target;
            var currentParrentSortClass;
            var sortClass;
            var sortConst;
            var sortBy;
            var sortObject;
            var data;

            this.startTime = new Date();

            $target = $(e.target).closest('li');
            currentParrentSortClass = $target.attr('class');
            sortClass = currentParrentSortClass.split(' ')[1];
            sortConst = 1;
            sortBy = $target.data('sort').split(' ');
            sortObject = {};

            if (!sortClass) {
                $target.addClass('sortUp');
                sortClass = 'sortUp';
            }

            switch (sortClass) {
                case 'sortDn':
                    $target.parent().find('li').removeClass('sortDn').removeClass('sortUp');
                    $target.removeClass('sortDn').addClass('sortUp');
                    sortConst = 1;
                    break;
                case 'sortUp':
                    $target.parent().find('li').removeClass('sortDn').removeClass('sortUp');
                    $target.removeClass('sortUp').addClass('sortDn');
                    sortConst = -1;
                    break;
                // skip default case
            }

            sortBy.forEach(function (sortField) {
                sortObject[sortField] = sortConst;
            });

            data = {
                sort: sortObject
            };

            data.filter = filter;

            if (this.viewType) {
                data.viewType = this.viewType;
            }
            if (this.parrentContentId) {
                data.parrentContentId = this.parrentContentId;
            }
            if (this.contentType) {
                data.contentType = this.contentType;
            }

            data.page = 1;

            this.changeLocationHash(null, this.collection.pageSize);
            this.collection.getFirstPage(data);
        },

        showMoreContent: function (newModels) {
            var persons = newModels.toJSON();
            var $holder = this.$el;
            var $listHolder = $holder.find('#listContent');

            $listHolder.empty();

            $listHolder.append(this.listTemplate({
                persons: persons
            }));

            $holder.find('#timeRecivingDataFromServer').remove();
            $holder.append('<div id="timeRecivingDataFromServer">Created in ' + (new Date() - this.startTime) + ' ms</div>');
        },

        renderFormView: function (e) {
            var $thisEl = this.$el;
            var $target;
            var modelId;
            var model;
            var self = this;
            var date = new Date();

            if (e.hasOwnProperty('target')) {
                $target = $(e.target);
                modelId = $target.closest('.compactView').data('id');

            } else {
                modelId = e;
            }

            model = new PersonsModel();
            model.urlRoot = model.url() + modelId;

            model.fetch({
                success: function (model) {

                    if (self.formView) {
                        self.formView.undelegateEvents();
                    }

                    self.formView = new FormView({model: model, el: '#formContent'});
                    self.formView.render();

                    $thisEl.find('#listContent .selected').removeClass('selected');
                    $thisEl.find('tr[data-id="' + modelId + '"]').addClass('selected');
                    self.selectedId = model.id;

                    self.changeLocationHash(self.collection.currentPage, self.collection.pageSize, self.filter);
                    $thisEl.find('#timeRecivingDataFromServer').remove();
                    $thisEl.append('<div id="timeRecivingDataFromServer">Created in ' + (new Date() - date) + ' ms</div>');
                },

                error: function (xhr, model) {

                }
            });
        },

        render: function () {
            var $currentEl;
            var persons = this.collection.toJSON();

            $('.ui-dialog ').remove();

            $currentEl = this.$el;

            $currentEl.html(this.contentTemplate());
            $currentEl.find('#listContent').append(this.listTemplate({
                persons: persons
            }));

        }
    });

    return PersonsListView;
});
