import express, { json } from "express";
import cors from "cors";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import instagramGetUrl from "instagram-url-direct";

const app = express();
app.use(cors());
app.use(json());

const port = process.env.port || 5001;


app.listen(port, () => {
  console.log("Server Works!");
});
app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello World",
  });
});

app.get("/pinterest", async (req, res) => {
  const url = req.query.url;
  try {
    if (url.match("pin.it")) {
      const longUrl = await expandURL(url);
      const { hostname, pathname } = new URL(longUrl);
      const path = pathname.replace("/sent/", "");
      const finalUrl = `https://${hostname}${path}`;
      const response = await fetch(finalUrl);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const body = await response.text();
      const video = new JSDOM(body).window.document.getElementsByTagName(
        "video"
      )[0].src;
      const thumbnailUrl = new JSDOM(body).window.document.getElementsByTagName(
        "video"
      )[0].poster;
      const outUrl = video.replace("/hls/", "/720p/").replace(".m3u8", ".mp4");
      res.status(200).send({
        url: outUrl,
        thumbnail: thumbnailUrl,
        title: "Pinterest shorten url",
      });
    } else {
      res.status(400).send({error: 'error'});
    }
    if (url.match("pinterest.com")) {
      const { hostname, pathname } = new URL(url);
      const path = pathname.replace("/sent/", "");
      const finalUrl = `https://${hostname}${path}`;
      const response = await fetch(finalUrl);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const body = await response.text();
      const video = new JSDOM(body).window.document.getElementsByTagName(
        "video"
      )[0].src;
      const thumbnailUrl = new JSDOM(body).window.document.getElementsByTagName(
        "video"
      )[0].poster;
      const outUrl = video.replace("/hls/", "/720p/").replace(".m3u8", ".mp4");
      console.log(outUrl);
      res.status(200).send({
        url: outUrl,
        thumbnail: thumbnailUrl,
        title: "Pinterest full url",
      });
    } else {
      res.status(400).send({error: 'error'});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});
app.get("/instagram", async (req, res) => {
  const url = req.query.url;
  try {
    if (url.match("instagram.com")) {
      const rsd = await instagramGetUrl(url);

      const uri = rsd.url_list[0];

      res.status(200).send({
        url: uri,
        title: "Instagram shorten url",
      });
    } else {
      res.status(200).send({
        error: "Not a valid url",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

async function expandURL(shortenURL) {
  const uri = new URL(shortenURL);
  const path = uri.pathname;
  const finalUrl = `https://api.pinterest.com/url_shortener${path}/redirect/`;
  try {
    let response = await fetch(finalUrl, {
      method: "HEAD",
      redirect: "manual",
    });
    let location = response.headers.get("location");
    return location;
  } catch (error) {
    console.error(error);
    return null;
  }
}
