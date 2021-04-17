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
"""add_custom_fulters

Revision ID: 5ff80fe13e97
Revises: b4176540e3f1
Create Date: 2021-04-16 17:58:33.842012

"""
# revision identifiers, used by Alembic.
revision = "5ff80fe13e97"
down_revision = ("45731db65d9c", )

import sqlalchemy as sa
from alembic import op


def upgrade():
    op.create_table(
        "slice_custom_filters",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slice_id", sa.Integer(), nullable=False),
        sa.Column("key", sa.String(200), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["slice_id"], ["slices.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
