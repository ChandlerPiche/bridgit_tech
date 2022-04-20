const { ApolloServer, gql } = require('apollo-server');
const { RESTDataSource } = require('apollo-datasource-rest');

// APIS
class NasaAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://images-api.nasa.gov/';
    }

    async getImages(q, from) {
        let response = null
        if (q == null) {
            response = await this.get(`/search?page=${encodeURIComponent(from)}&media_type=image`)
        } else {
            response = await this.get(`/search?q=${encodeURIComponent(q)}&page=${encodeURIComponent(from)}&media_type=image`)
        }

        var results = await Promise.all(response.collection.items.map(async (item) => {
            const hrefs = await this.get(item.href)
            const is_video = hrefs.find(href => {
                if (href.includes("video")) {
                    return true;
                }
            });

            if (!is_video) {
                let result_href = hrefs[0]
                hrefs.forEach(href => {
                    if (href.endsWith("small.jpg")) {
                        result_href = href;
                    }
                });
                return {
                    href: result_href,
                    description: item.data[0].description,
                    title: item.data[0].title
                }
            }
        }));

        return results;
    }
}

// SCHEMA DEFINITION
const typeDefs = gql`
  type Image {
      href: String!
      description: String!
      title: String!
  }

  type Query {
    images(q: String!, from: Int!): [Image]
  }
`;

// RESOLVERS
const resolvers = {
    Query: {
        images: async (_, { q, from }, { dataSources }) => {
            return dataSources.nasaAPI.getImages(q, from);
        },
    },
};

const server = new ApolloServer({ 
    typeDefs, 
    resolvers, 
    dataSources: () => {
        return {
            nasaAPI: new NasaAPI(),
        };
    },
    context: ({ req }) => {
        const token = req.headers.Authorization || '';
        return { token };
    },
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});