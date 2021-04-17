# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
import json
import logging
from typing import Any, Dict, Optional, Type

from flask_appbuilder import Model
from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import backref, relationship

from superset import ConnectorRegistry, db
from superset.utils import core as utils


metadata = Model.metadata  # pylint: disable=no-member
logger = logging.getLogger(__name__)


class SliceCustomFilter(Model):  # pylint: disable=too-many-public-methods

    """A slice_filter is custom user data to be provided to SQL"""

    __tablename__ = "slice_custom_filters"
    id = Column(Integer, primary_key=True)
    slice_id = Column(Integer, ForeignKey("slices.id"))
    slice = relationship(
        "Slice",
        backref=backref("slice_custom_filters", cascade="all, delete-orphan"),
        foreign_keys=[slice_id],
        # primaryjoin="Slice.id == SliceCustomFilter.slice_id"
    )
    key = Column(String(200))
    value = Column(Text)
    # Все поля сделать nullable=False

    # export_fields = [
    #     "slice_id",
    #     "slice",
    #     "key",
    #     "value",
    # ]

    def __repr__(self) -> str:
        return f"{self.slice_id} - {self.key}"

    @property
    def cls_model(self) -> Type["BaseDatasource"]:
        return ConnectorRegistry.sources[self.datasource_type]

    @property
    def datasource(self) -> "BaseDatasource":
        return self.get_datasource

    def clone(self) -> "SliceCustomFilter":
        return SliceCustomFilter(
            slice=self.slice,
            key=self.key,
            value=self.value
        )

    # pylint: disable=using-constant-test
    @datasource.getter  # type: ignore
    @utils.memoized
    def get_datasource(self) -> Optional["BaseDatasource"]:
        return db.session.query(self.cls_model).filter_by(id=self.slice.datasource_id).first()

    @property
    def data(self) -> Dict[str, Any]:
        """CustomFilter data"""
        return {
            "key": self.key,
            "value": self.value,
            "slice_id": self.slice_id,
            "datasource_id": self.slice.datasource_id,
        }

    @property
    def json_data(self) -> str:
        return json.dumps(self.data)
