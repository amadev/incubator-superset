/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Button from 'src/components/Button';
import { styled, t } from '@superset-ui/core';

import Tabs from 'src/common/components/Tabs';
import CustomFilter from '../CustomFilter';
import AdhocFilterEditPopover, { ResizeIcon, startingWidth, startingHeight } from './AdhocFilterEditPopover';
import CustomFilterEditPopoverTabContent from './CustomFilterEditPopoverTabContent';

const propTypes = {
  customFilter: PropTypes.instanceOf(CustomFilter).isRequired,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onResize: PropTypes.func.isRequired,
  datasource: PropTypes.object,
  theme: PropTypes.object,
};

export default class CustomFilterEditPopover extends AdhocFilterEditPopover {
  constructor(props) {
    super(props);

    this.state = {
      customFilter: this.props.customFilter,
      width: startingWidth,
      height: startingHeight,
    };
  }

  onFilterChange(customFilter) {
    this.setState({ customFilter });
  }

  onSave() {
    // unset isNew here in case save button was clicked when no changes were made
    this.props.onChange({ ...this.state.customFilter, isNew: false });
    this.props.onClose();  // TODO закрытие одного таба должно закрывать все остальные открытые
  }

  render() {
    const {
      customFilter: propsCustomFilter,
      options,
      onChange,
      onClose,
      onResize,
      datasource,
      theme,
      ...popoverProps
    } = this.props;

    const { customFilter } = this.state;

    const stateIsValid = customFilter.isValid();
    const hasUnsavedChanges = !customFilter.equals(propsCustomFilter);

    return (
      <div
        id="filter-edit-popover"
        {...popoverProps}
        data-test="filter-edit-popover"
        ref={this.popoverContentRef}
      >
        <Tabs
          id="adhoc-filter-edit-tabs"
          defaultActiveKey={"CustomFilter"}
          className="adhoc-filter-edit-tabs"
          data-test="adhoc-filter-edit-tabs"
          style={{ height: this.state.height, width: this.state.width }}
        >
          <Tabs.TabPane  // теперь табы не нужны, но в будущем можно будет добавить другой тип фильтра в новый таб
            className="adhoc-filter-edit-tab"
            key={"CustomFilter"}
            tab={t("Add Custom Filter")}
          >
            <CustomFilterEditPopoverTabContent
              customFilter={this.state.customFilter}
              onChange={this.onFilterChange}
              datasource={datasource}
              onHeightChange={this.adjustHeight}
              popoverRef={this.popoverContentRef.current}
            />
          </Tabs.TabPane>
        </Tabs>
        <div>
          <Button buttonSize="small" onClick={this.props.onClose} cta>
            {t('Close')}
          </Button>
          <Button
            data-test="adhoc-filter-edit-popover-save-button"
            disabled={!stateIsValid}
            buttonStyle={
              hasUnsavedChanges && stateIsValid ? 'primary' : 'default'
            }
            buttonSize="small"
            className="m-r-5"
            onClick={this.onSave}
            cta
          >
            {t('Save')}
          </Button>
          <ResizeIcon
            role="button"
            aria-label="Resize"
            tabIndex={0}
            onMouseDown={this.onDragDown}
            className="fa fa-expand edit-popover-resize text-muted"
          />
        </div>
      </div>
    );
  }
}

CustomFilterEditPopover.propTypes = propTypes;
