// This file is used in the importmap to export the Meteor global APIs from "meteor/*" packages.
// See the importmap in public/index.html.
const global = globalThis as any
export const Meteor = global.Meteor
export const Tracker = global.Package.tracker.Tracker
export const Mongo = global.Package.mongo.Mongo
export const Session = global.Package.session.Session
export const ReactiveVar = global.Package['reactive-var'].ReactiveVar
export const Blaze = global.Package.blaze.Blaze
export const Template = global.Package.templating.Template
export const Accounts = global.Package['accounts-base'].Accounts
