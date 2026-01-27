json.extract! user, :id , :username , :preferred_name, :user_role, :pronunciation,:email
json.photoUrls url_for(user.photo) if user.photo.attached? 