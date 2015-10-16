require( "../setup" );
var url = require( "../../src/urlTemplate.js" );
var HyperResource = require( "../../src/hyperResource.js" );

var resources = require( "./resources.js" );

describe( "Hyper Resource", function() {
	describe( "when rendering actions", function() {
		describe( "when rendering action with specific version", function() {
			var parameters = {
				page: { range: [ 1, 1 ] },
				size: { range: [ 1, 100 ] }
			};
			var expected = {
				id: 1,
				title: "test",
				_origin: { href: "/parent/1", method: "GET" },
				_resource: "parent",
				_action: "self",
				_links: {
					self: { href: "/parent/1", method: "GET" },
					children: { href: "/parent/1/child", method: "GET", parameters: parameters },
					"next-child-page": { href: "/parent/1/child?page=2&size=5", method: "GET", parameters: parameters }
				}
			};
			var response;
			var data = {
				id: 1,
				title: "test",
				description: "this is a test",
				children: [ {}, {}, {}, {}, {} ]
			};
			var requestData = {
				page: 1,
				size: 5
			};

			before( function() {
				var fn = HyperResource.resourceGenerator( resources, "", 2 );
				response = fn( "parent", "self", { data: requestData }, data, "" );
			} );

			it( "should return the correct response", function() {
				return response.should.eventually.eql( expected );
			} );
		} );

		describe( "when rendering action without embedded resources", function() {
			var parameters = {
				page: { range: [ 1, 1 ] },
				size: { range: [ 1, 100 ] }
			};
			var expected = {
				id: 1,
				title: "test",
				description: "this is a test",
				children: [ {}, {}, {}, {}, {} ],
				_origin: { href: "/parent/1", method: "GET" },
				_resource: "parent",
				_action: "self",
				_links: {
					self: { href: "/parent/1", method: "GET" },
					children: { href: "/parent/1/child", method: "GET", parameters: parameters },
					"next-child-page": { href: "/parent/1/child?page=2&size=5", method: "GET", parameters: parameters }
				}
			};
			var response;
			var data = {
				id: 1,
				title: "test",
				description: "this is a test",
				children: [ {}, {}, {}, {}, {} ]
			};
			var requestData = {
				page: 1,
				size: 5
			};

			before( function() {
				var fn = HyperResource.resourceGenerator( resources );
				response = fn( "parent", "self", { data: requestData }, data, "" );
			} );

			it( "should return the correct response", function() {
				return response.should.eventually.eql( expected );
			} );
		} );

		describe( "when rendering action with embedded resources including parent id in result", function() {
			var expected = require( "./actionWithEmbeddedResources.js" );
			var response;
			var data = {
				id: 2,
				parentId: 1,
				title: "child",
				grandChildren: [ { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 } ]
			};
			var envelope = {
				user: {
					name: "Evenly"
				}
			};
			before( function() {
				var fn1 = HyperResource.resourceGenerator( resources, { urlPrefix: "/test", apiPrefix: "/api" } );
				response = fn1( "child", "self", envelope, data );
			} );

			it( "should return the correct response", function() {
				return response.should.eventually.eql( expected );
			} );
		} );
	} );

	describe( "when rendering options including children", function() {
		var expected = {
			_mediaTypes: [],
			_versions: [ "1", "2" ],
			_links: {
				"parent:self": { href: "/parent/{id}", method: "GET", templated: true },
				"parent:list": { href: "/parent", method: "GET" },
				"parent:children": { href: "/parent/{id}/child", method: "GET", templated: true, parameters: {
						size: { range: [ 1, 100 ] }
					} },
				"parent:bogus": { href: "/parent/bogus", method: "GET" },
				"child:self": { href: "/parent/{parentId}/child/{id}", method: "GET", templated: true },
				"child:change": { href: "/parent/{parentId}/child/{id}", method: "PUT", templated: true },
				"grandChild:self": { href: "/parent/{parentId}/child/{childId}/grand/{id}", method: "GET", templated: true },
				"grandChild:create": { href: "/parent/{parentId}/child/{childId}/grand", method: "POST", templated: true },
				"grandChild:delete": { href: "/parent/{parentId}/child/{childId}/grand/{id}", method: "DELETE", templated: true }
			}
		};
		var options;

		before( function() {
			var fn = HyperResource.optionsGenerator( resources, undefined, undefined, undefined, undefined, true );
			options = fn( {}, {} );
		} );

		it( "should render options correctly", function() {
			return options.should.eventually.eql( expected );
		} );
	} );

	describe( "when rendering options excluding children", function() {
		var expected = {
			_mediaTypes: [],
			_versions: [ "1", "2" ],
			_links: {
				"parent:self": { href: "/parent/{id}", method: "GET", templated: true },
				"parent:list": { href: "/parent", method: "GET" },
				"parent:children": { href: "/parent/{id}/child", method: "GET", templated: true, parameters: {
						size: { range: [ 1, 100 ] }
					} }
			}
		};
		var options;

		before( function() {
			var fn = HyperResource.optionsGenerator( resources, "", undefined, true );
			options = fn();
		} );

		it( "should render options correctly", function() {
			return options.should.eventually.eql( expected );
		} );
	} );

	describe( "when rendering a list of top-level resources", function() {
		var expected = require( "./topLevelResources.js" );
		var response;
		var data = [
			{
				id: 1,
				title: "one",
				description: "the first item",
				children: [ {} ]
			},
			{
				id: 2,
				title: "two",
				description: "the second item",
				children: [ {} ]
			}
		];

		before( function() {
			var fn1 = HyperResource.resourcesGenerator( resources );
			response = fn1( "parent", "self", {}, data, "", "/parent", "GET" );
		} );

		it( "should return the correct response", function() {
			return response.should.eventually.eql( expected );
		} );
	} );

	describe( "when rendering a list of resources from another resource", function() {
		var expected = require( "./listFromOtherResource.js" );
		var response;
		var data = [
			{
				id: 1,
				parentId: 1,
				title: "one",
				description: "the first item"
			},
			{
				id: 2,
				parentId: 1,
				title: "two",
				description: "the second item"
			},
			{
				id: 3,
				parentId: 1,
				title: "three",
				description: "the third item"
			}
		];
		var elapsed;

		before( function() {
			var fn1 = HyperResource.resourcesGenerator( resources );
			var envelope = {
				user: {
					name: "Oddly"
				}
			};
			response = fn1( "child", "self", envelope, data, "", "/parent/1/child", "GET" );
		} );

		it( "should return the correct response", function() {
			return response.should.eventually.eql( expected );
		} );
	} );
} );
