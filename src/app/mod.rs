use rocket_contrib::serve::StaticFiles;

pub fn start() {
    rocket::ignite()
        .mount(
            "/minesweeper",
            StaticFiles::from(concat!(env!("CARGO_MANIFEST_DIR"), "/public")),
        )
        .launch();
}
