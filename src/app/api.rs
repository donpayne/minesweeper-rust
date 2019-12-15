use rocket::http::RawStr;
// use rocket::response::NamedFile;
// use std::path::{Path, PathBuf};

/// http://localhost:8000/api/start
#[get("/start")]
pub fn start() -> &'static str {
    "Starting App"
}

/// http://localhost:8000/api/hello/Luke
#[get("/hello/<name>")]
pub fn helloraw(name: &RawStr) -> String {
    format!("Hello, {}!", name.as_str())
}

/// http://localhost:8000/api/hello/Luke/12/true
#[get("/hello/<name>/<age>/<cool>")]
pub fn hellosafe(name: String, age: u8, cool: bool) -> String {
    if cool {
        format!("You're a cool {} year old, {}!", age, name)
    } else {
        format!("{}, we need to talk about your coolness.", name)
    }
}

// /// http://localhost:8000/api/somefile
// #[get("/public/<file..>")]
// pub fn files(file: PathBuf) -> Option<NamedFile> {
//     NamedFile::open(Path::new("static/").join(file)).ok()
// }
