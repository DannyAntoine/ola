/**
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Library General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 *
 * The RDM Tab.
 * Copyright (C) 2010 Simon Newton
 */

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.math');
goog.require('goog.Timer');
goog.require('goog.ui.Container');
goog.require('goog.ui.Component');
goog.require('goog.ui.Toolbar');
goog.require('goog.ui.ToolbarButton');
goog.require('goog.ui.ToolbarMenuButton')
goog.require('goog.ui.ToolbarSeparator');
goog.require('goog.ui.SplitPane');
goog.require('goog.ui.SplitPane.Orientation');

goog.require('ola.Dialog');
goog.require('ola.RDMAttributesPanel');
goog.require('ola.common.BaseUniverseTab');
goog.require('ola.common.Server');
goog.require('ola.common.Server');
goog.require('ola.common.Server.EventType');
goog.require('ola.common.SortedList');
goog.require('ola.common.UidControl');
goog.require('ola.common.UidControlFactory');

goog.provide('ola.RDMTab');


/**
 * The RDM Tab.
 * @constructor
 */
ola.RDMTab = function(element) {
  ola.common.BaseUniverseTab.call(this, element);

  var toolbar = new goog.ui.Toolbar();
  toolbar.decorate(goog.dom.$('rdm_toolbar'));

  var discovery_button = toolbar.getChild('discoveryButton')
  discovery_button.setTooltip('Force RDM Discovery for this universe');
  goog.events.listen(discovery_button,
                     goog.ui.Component.EventType.ACTION,
                     function() { this._discoveryButtonClicked(); },
                     false,
                     this);

  this.splitpane = new goog.ui.SplitPane(
      new goog.ui.Component(),
      new goog.ui.Component(),
      goog.ui.SplitPane.Orientation.HORIZONTAL);
  this.splitpane.setInitialSize(250);
  this.splitpane.setHandleSize(2);
  this.splitpane.decorate(goog.dom.$('rdm_split_pane'));

  var rdm_panel = new ola.RDMAttributesPanel('rdm_attributes', toolbar);
  this.rdm_panel = rdm_panel;

  var frame = this;
  var uid_container = new goog.ui.Container();
  uid_container.decorate(goog.dom.$('uid_container'));
  this.uid_list = new ola.common.SortedList(
      uid_container,
      new ola.common.UidControlFactory(
        function (item) { rdm_panel.showUID(item); }));

  // setup the uid timer
  this.uid_timer = new goog.Timer(ola.RDMTab.UID_REFRESH_INTERVAL);
  goog.events.listen(
      this.uid_timer,
      goog.Timer.TICK,
      function() {
        if (this.current_universe != undefined) {
          var frame = this;
          ola.common.Server.getInstance().fetchUids(
            this.current_universe,
            function(e) { return frame._updateUidList(e); });
        }
      },
      false,
      this);
};
goog.inherits(ola.RDMTab, ola.common.BaseUniverseTab);


ola.RDMTab.UID_REFRESH_INTERVAL = 5000;

/**
 * Set the universe for the patcher
 */
ola.RDMTab.prototype.setUniverse = function(universe_id) {
  ola.RDMTab.superClass_.setUniverse.call(this, universe_id);
  this.rdm_panel.updateUniverse(universe_id);
  this.rdm_panel.clear();
};


/**
 * Called when the view port size changes
 */
ola.RDMTab.prototype.sizeChanged = function(frame_size) {
  // don't call the base method.
  this.splitpane.setSize(
      new goog.math.Size(frame_size.width - 7, frame_size.height - 62));
};


/**
 * Controls if we should do all the work involved in rendering the patcher.
 * This isn't needed if the patcher isn't visible.
 */
ola.RDMTab.prototype.setActive = function(state) {
  ola.RDMTab.superClass_.setActive.call(this, state);

  if (this.isActive()) {
    var tab = this;
    var server = ola.common.Server.getInstance();
    server.fetchUids(
        this.getUniverse(),
        function(e) { tab._updateUidList(e); });
    this.uid_timer.start();
  } else {
    this.uid_timer.stop();
  }
};


/**
 * Update the UID list
 * @private
 */
ola.RDMTab.prototype._updateUidList = function(e) {
  if (e.target.getStatus() != 200) {
    ola.logger.info('Request failed: ' + e.target.getLastUri() + ' : ' +
        e.target.getLastError());
    return;
  }

  var obj = e.target.getResponseJson();
  var uids = obj['uids'];

  var items = new Array();
  for (var i = 0; i < uids.length; ++i) {
    items.push(new ola.common.UidItem(uids[i]));
  }
  this.uid_list.updateFromData(items);
};


/**
 * Called when the discovery button is clicked.
 * @private
 */
ola.RDMTab.prototype._discoveryButtonClicked = function(e) {
  var server = ola.common.Server.getInstance();
  var tab = this;
  server.runRDMDiscovery(
      this.getUniverse(),
      function(e) { tab._discoveryComplete(e); });

  var dialog = ola.Dialog.getInstance();
  dialog.SetAsBusy();
  dialog.setVisible(true);
};


/**
 * Called when the discovery request returns. This doesn't actually mean that
 * the discovery process has completed, just that it's started.
 * @private
 */
ola.RDMTab.prototype._discoveryComplete = function(e) {
  var dialog = ola.Dialog.getInstance();
  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.OK);
  if (e.target.getStatus() == 200) {
    dialog.setTitle('Discovery Process Started');
    dialog.setContent('The discovery process has begun.');
  } else {
    dialog.setTitle('Failed to Start Discovery Process');
    dialog.setContent(e.target.getLastUri() + ' : ' + e.target.getLastError());
  }
  dialog.setVisible(true);
};
