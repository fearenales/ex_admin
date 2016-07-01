/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */
// Adds the systems that shape your system
systems({
  'ex-admin': {
    // Dependent systems
    depends: ["postgres"],
    // More images:  http://images.azk.io
    image: {"docker": "azukiapp/elixir:1.2"},
    // Steps to execute before running instances
    provision: [
      "npm install",
      "mix do deps.get, compile",
      "mix ecto.create",
      "mix ecto.migrate",
    ],
    workdir: "/azk/#{manifest.dir}",
    command: ["mix", "phoenix.server", "--no-deps-check"],
    wait: 20,
    mounts: {
      '/azk/#{manifest.dir}': sync("."),
      '/azk/#{manifest.dir}/deps': persistent("./deps"),
      '/azk/#{manifest.dir}/_build': persistent("./_build"),
      '/root/.hex': persistent("#{env.HOME}/.hex"),
      '/azk/#{manifest.dir}/node_modules': persistent("./node_modules"),
      '/azk/#{manifest.dir}/priv/static': persistent("./priv/static"),
    },
    scalable: {"default": 1},
    http: {
      domains: [ "#{system.name}.#{azk.default_domain}" ]
    },
    ports: {
      // exports global variables
      http: "4000",
    },
    envs: {
      // Make sure that the PORT value is the same as the one
      // in ports/http below, and that it's also the same
      // if you're setting it in a .env file
      EXAMPLE: "value",
    },
  },
  postgres: {
    // More info about postgres image: http://images.azk.io/#/postgres?from=images-azkfile-postgres
    image: {"docker": "azukiapp/postgres:9.5"},
    shell: "/bin/bash",
    wait: 25,
    mounts: {
      '/var/lib/postgresql/data': persistent("#{system.name}-data"),
      // to clean postgres data, run:
      // $ azk shell postgres -c "rm -rf /var/lib/postgresql/data/*"
    },
    ports: {
      // exports global variables: "#{net.port.data}"
      data: "5432/tcp",
    },
    envs: {
      // set instances variables
      POSTGRES_USER: "azk",
      POSTGRES_PASS: "azk",
      POSTGRES_DB  : "#{manifest.dir}",
    },
    export_envs: {
      // check this gist to configure your database
      // Exlir eg in: https://github.com/azukiapp/hello_phoenix/blob/master/config/database.uri.exs
      DATABASE_URL: "ecto+postgres://#{envs.POSTGRES_USER}:#{envs.POSTGRES_PASS}@#{net.host}:#{net.port.data}/#{envs.POSTGRES_DB}",
    },
  },
});
