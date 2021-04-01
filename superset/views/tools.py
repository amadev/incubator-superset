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

import requests
import simplejson as json
from flask import g, redirect, request, Response, send_from_directory
from flask_appbuilder import expose
from flask_appbuilder.security.decorators import has_access

from superset import app, appbuilder, conf
from superset.typing import FlaskResponse
from superset.utils import core as utils
from superset.views.base import BaseSupersetView, common_bootstrap_payload
from superset.views.utils import bootstrap_user_data

config = app.config


class Tools(BaseSupersetView):
    """The base views for Superset!"""

    @has_access
    @expose("/nextgis")
    def index(self) -> FlaskResponse:  # pylint: disable=no-self-use
        host = config.get("NEXTGIS_IP", config["NEXTGIS_HOST"])
        url = f"https://{host}/api/component/render/image"
        rh = {}
        rh["Authorization"] = config["NEXTGIS_AUTH"]
        rh["Host"] = config["NEXTGIS_HOST"]

        resp = requests.request(
            method=request.method,
            url=url,
            headers=rh,
            params=request.args,
            verify=False,
        )

        excluded_headers = [
            "content-encoding",
            "content-length",
            "transfer-encoding",
            "connection",
        ]
        headers = [
            (name, value)
            for (name, value) in resp.raw.headers.items()
            if name.lower() not in excluded_headers
        ]

        response = Response(resp.content, resp.status_code, headers)
        return response
