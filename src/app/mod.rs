use rocket::routes;
use rocket_contrib::serve::StaticFiles;

pub mod api;

pub fn start() {
    rocket::ignite()
        .mount(
            "/api",
            routes![
                api::start,
                api::helloraw,
                api::hellosafe,
                // api::files
            ],
        )
        .mount(
            "/minesweeper",
            StaticFiles::from(concat!(env!("CARGO_MANIFEST_DIR"), "/public")),
        )
        .launch();
}
