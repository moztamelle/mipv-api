create table if not exists users (
	id INT GENERATED ALWAYS AS IDENTITY (START WITH 2008) primary key,
	name varchar(100) not null,
	email_whatsapp varchar(100) default null,
	phone varchar(20) default null,
	address varchar(255) default null,
	token varchar(255) default null,
	password varchar(255) default null,
	hash_confirmation varchar(255) default null,
	status varchar(50) default null,
	access varchar(10) default 'USER',
	country varchar(100) default null,
	gender char default null,
	photo text default null,
	doc_type varchar(50) default null,
	doc_id varchar(100) default null,
	birthday date default null,
	type varchar(50) default null
);
CREATE TABLE IF NOT EXISTS media (
	id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	album VARCHAR(255) NOT NULL,
	type VARCHAR(50) NOT NULL,
	url TEXT NOT NULL,
	date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);