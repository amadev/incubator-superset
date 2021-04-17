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
import CustomFilterEditPopoverTabContent from './CustomFilterEditPopoverTabContent';

const propTypes = {
  customFilter: PropTypes.instanceOf(CustomFilter).isRequired,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onResize: PropTypes.func.isRequired,
  datasource: PropTypes.object,
  theme: PropTypes.object,
};

const ResizeIcon = styled.i`
  margin-left: ${({ theme }) => theme.gridUnit * 2}px;
`;

const startingWidth = 320;
const startingHeight = 240;

export default class CustomFilterEditPopover extends React.Component {
  constructor(props) {
    super(props);
    this.onSave = this.onSave.bind(this);
    this.onDragDown = this.onDragDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onCustomFilterChange = this.onCustomFilterChange.bind(this);
    this.adjustHeight = this.adjustHeight.bind(this);

    this.state = {
      customFilter: this.props.customFilter,
      width: startingWidth,
      height: startingHeight,
    };

    this.popoverContentRef = React.createRef();
  }

  componentDidMount() {
    document.addEventListener('mouseup', this.onMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMove);
  }

  onCustomFilterChange(customFilter) {
    // console.log("onCustomFilterChange");
    // console.log(this.state);
    this.setState({ customFilter });
  }

  onSave() {
    // console.log("ON SAVE TAB");
    // unset isNew here in case save button was clicked when no changes were made
    // console.log(this.props);
    // console.log(this.state);
    this.props.onChange({ ...this.state.customFilter, isNew: false });
    this.props.onClose();  // TODO закрытие одного таба должно закрывать все остальные открытые
  }

  onDragDown(e) {
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.dragStartWidth = this.state.width;
    this.dragStartHeight = this.state.height;
    document.addEventListener('mousemove', this.onMouseMove);
  }

  onMouseMove(e) {
    this.props.onResize();
    this.setState({
      width: Math.max(
        this.dragStartWidth + (e.clientX - this.dragStartX),
        startingWidth,
      ),
      height: Math.max(
        this.dragStartHeight + (e.clientY - this.dragStartY) * 2,
        startingHeight,
      ),
    });
  }

  onMouseUp() {
    document.removeEventListener('mousemove', this.onMouseMove);
  }

  adjustHeight(heightDifference) {
    this.setState(state => ({ height: state.height + heightDifference }));
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
          <Tabs.TabPane  // теперь табы не нужны, но в будущем можно будет добавить другой тип фильтров
            className="adhoc-filter-edit-tab"
            key={"CustomFilter"}
            tab={t("Add Custom Filter")}
          >
            <CustomFilterEditPopoverTabContent
              customFilter={this.state.customFilter}
              onChange={this.onCustomFilterChange}
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
