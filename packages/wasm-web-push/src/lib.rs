use wasm_bindgen::prelude::*;



// Import the `window.alert` function from the Web.
#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

// Export a `greet` function from Rust to JavaScript, that alerts a
// hello message.
#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}



// #[wasm_bindgen]
// pub async fn test_web_push() -> Result<(), WebPushError> {
//     // let endpoint = "https://updates.push.services.mozilla.com/wpush/v1/...";
//     // let p256dh = "key_from_browser_as_base64";
//     // let auth = "auth_from_browser_as_base64";
    
//     // //You would likely get this by deserializing a browser `pushSubscription` object.  
//     // let subscription_info = SubscriptionInfo::new(
//     //     endpoint,
//     //     p256dh,
//     //     auth
//     // );
    
//     // //Read signing material for payload.
//     // let file = File::open("private.pem").unwrap();
//     // let mut sig_builder = VapidSignatureBuilder::from_pem(file, &subscription_info)?.build()?;
    
//     // //Now add payload and encrypt.
//     // let mut builder = WebPushMessageBuilder::new(&subscription_info)?;
//     // let content = "Encrypted payload to be sent in the notification".as_bytes();
//     // builder.set_payload(ContentEncoding::Aes128Gcm, content);
//     // builder.set_vapid_signature(sig_builder);
    
//     // let client = WebPushClient::new()?;
    
//     // //Finally, send the notification!
//     // client.send(builder.build()?).await?;

//     Ok(())
// }