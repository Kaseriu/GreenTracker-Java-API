import {config} from "dotenv";
config();
import {DatabaseUtils} from "./database/database";

async function test() {
    const str = await DatabaseUtils.getConnection();
    const test = await str.execute('SHOW TABLES');
    console.log(test[0]);
    console.log("test committttt");
}
test();
