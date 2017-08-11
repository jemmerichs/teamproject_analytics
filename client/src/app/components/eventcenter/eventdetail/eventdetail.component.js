"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var Event_1 = require("../../../model/Event");
var event_service_1 = require("../../../services/event.service");
var bundle_service_1 = require("../../../services/bundle.service");
var router_1 = require("@angular/router");
var ng2_webstorage_1 = require('ng2-webstorage');
var EventdetailComponent = (function () {
    function EventdetailComponent(eventService, bundleService, router, storage) {
        this.eventService = eventService;
        this.bundleService = bundleService;
        this.router = router;
        this.storage = storage;
        this.bundles = new Array();
        if (this.eventService.safebuttonclicked == false) {
            //working on edit mode - start with blank
            //load current Event + Bundles + Articles into Storage
            this.event = this.eventService.event;
            var bundletemp = this.event.bundles;
            //Transform from JSON to Array
            var count = 0;
            for (var propName in bundletemp) {
                this[propName] = bundletemp[propName];
                this.bundles[count] = this[propName];
                count++;
            }
            this.storage.store('event', this.event);
            console.log(this.bundles);
        }
        else {
            //working on create mode
            //start with empty default storage
            //build event
            this.event = new Event_1.Event();
            this.event.title = "Sample Title";
            this.event.start = "Sample Start";
            this.event.end = "Sample End";
            //build bundles
            var n = 0;
            while (n < 2) {
                this.bundle = {
                    title: "Please edit the Bundle",
                    description: "Sample Description",
                    picture: "...",
                    id: n
                };
                this.bundles[n] = this.bundle;
                n++;
            }
            this.event.bundles = this.bundles;
        }
    }
    EventdetailComponent.prototype.addEvent = function () {
        event.preventDefault();
        var newEvent = new Event_1.Event();
        newEvent.title = this.event.title;
        newEvent.start = this.event.start;
        newEvent.end = this.event.end;
        newEvent.bundles = this.event.bundles;
        newEvent.articles = null;
        this.eventService.addEvent(newEvent)
            .subscribe();
    };
    EventdetailComponent.prototype.updateEvent = function (event) {
        var _event = {
            title: event.title,
            start: event.start,
            end: event.end,
            id: event.id,
            bundles: event.bundles,
            articles: event.articles
        };
        this.eventService.updateEvent(_event)
            .subscribe();
    };
    EventdetailComponent.prototype.onEdit = function (bundle) {
        event.preventDefault();
        this.storage.store('event', this.event);
        this.storage.store('bundle_id', bundle.id);
    };
    EventdetailComponent.prototype.cancel = function () {
        event.preventDefault();
        this.storage.clear();
    };
    EventdetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'eventdetail',
            templateUrl: "eventdetail.component.html",
            styleUrls: ["eventdetail.component.css"]
        }), 
        __metadata('design:paramtypes', [event_service_1.EventService, bundle_service_1.BundleService, router_1.Router, ng2_webstorage_1.SessionStorageService])
    ], EventdetailComponent);
    return EventdetailComponent;
}());
exports.EventdetailComponent = EventdetailComponent;
//# sourceMappingURL=eventdetail.component.js.map